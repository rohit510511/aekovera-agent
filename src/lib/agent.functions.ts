import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const AI_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";
const MODEL = "google/gemini-3-flash-preview";

type ChatMsg = { role: "system" | "user" | "assistant"; content: string };

async function callAI(messages: ChatMsg[], opts?: { json?: boolean }): Promise<string> {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) throw new Error("AI is not configured (missing key).");
  const body: Record<string, unknown> = { model: MODEL, messages };
  if (opts?.json) body.response_format = { type: "json_object" };
  const res = await fetch(AI_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    body: JSON.stringify(body),
  });
  if (res.status === 429) throw new Error("RATE_LIMIT");
  if (res.status === 402) throw new Error("CREDITS");
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`AI request failed (${res.status}): ${t.slice(0, 200)}`);
  }
  const data = await res.json();
  return data?.choices?.[0]?.message?.content ?? "";
}

function safeJson<T>(text: string, fallback: T): T {
  try {
    const cleaned = text.replace(/```json/gi, "").replace(/```/g, "").trim();
    return JSON.parse(cleaned) as T;
  } catch {
    return fallback;
  }
}

function briefText(c: Record<string, unknown>): string {
  return `BRAND: ${c.brand}
PRODUCT: ${c.product}
CATEGORY: ${c.category}
VOLUME: ${c.volume}
PACKAGING: ${c.packaging}
TECHNICAL REQUIREMENTS: ${c.technical_requirements}
CERTIFICATIONS NEEDED: ${c.certifications_needed}
TARGET LAUNCH: ${c.target_launch}
BUDGET/NOTES: ${c.budget_notes}
COMPETITOR REFERENCE: ${c.competitor_reference}`;
}

// ---------- SCORE CAMPAIGN ----------
export const scoreCampaign = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { campaignId: string }) => d)
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: campaign, error: cErr } = await supabase
      .from("campaigns").select("*").eq("id", data.campaignId).single();
    if (cErr || !campaign) throw new Error("Campaign not found");

    const { data: suppliers } = await supabase
      .from("suppliers").select("*").order("ref_id");
    const { data: partners } = await supabase.from("partners").select("company_name,email");
    const partnerNames = new Set((partners ?? []).map((p: { company_name: string }) => p.company_name.toLowerCase()));

    const list = (suppliers ?? []) as Array<Record<string, unknown>>;
    const prompt = `You are Aekovera's sourcing agent. Score how well each supplier matches the client brief (0-100).
Consider product category, capabilities (claimed + can_do), required technical capabilities, fill type, certifications, MOQ/volume fit.
Penalize heavily if the supplier's "cannot_do" or "last_response" of "No" conflicts with the requirements (so we don't re-email them for things they can't do).

CLIENT BRIEF:
${briefText(campaign)}

SUPPLIERS (JSON):
${JSON.stringify(list.map((s) => ({ id: s.id, company: s.company_name, type: s.supplier_type, categories: s.product_categories, capabilities: s.capabilities_claimed, can_do: s.can_do, cannot_do: s.cannot_do, fill: s.fill_type, certs: s.certifications, moq: s.moq, last_response: s.last_response })))}

Return ONLY JSON: {"matches":[{"id":"<supplier id>","score":<0-100>,"reason":"<one concise sentence>"}]}. Include every supplier.`;

    let matches: Array<{ id: string; score: number; reason: string }> = [];
    try {
      const out = await callAI([{ role: "user", content: prompt }], { json: true });
      matches = safeJson<{ matches: typeof matches }>(out, { matches: [] }).matches ?? [];
    } catch (e) {
      if (e instanceof Error && (e.message === "RATE_LIMIT" || e.message === "CREDITS")) throw e;
      matches = [];
    }
    // Heuristic fallback / merge
    const scoreMap = new Map(matches.map((m) => [m.id, m]));

    // competitor co-manufacturers (outside the database)
    let competitorComans: Array<{ company: string; contact: string; email: string; reason: string }> = [];
    if (campaign.competitor_reference) {
      try {
        const out = await callAI([{ role: "user", content: `The client admires competitors described as: "${campaign.competitor_reference}". For a ${campaign.category} product (${campaign.product}), invent 2 realistic-sounding co-manufacturers that likely produce for such competitors and that we should cold-email. Return ONLY JSON: {"comans":[{"company":"...","contact":"...","email":"...","reason":"..."}]}` }], { json: true });
        competitorComans = safeJson<{ comans: typeof competitorComans }>(out, { comans: [] }).comans ?? [];
      } catch { competitorComans = []; }
    }

    // Remove existing rows for a clean re-score
    await supabase.from("campaign_suppliers").delete().eq("campaign_id", data.campaignId);

    const rows: Array<Record<string, unknown>> = [];
    for (const s of list) {
      const m = scoreMap.get(s.id as string);
      const score = m ? Math.max(0, Math.min(100, Math.round(m.score))) : 30;
      if (score < 45) continue; // only carry forward plausible matches
      rows.push({
        user_id: userId,
        campaign_id: data.campaignId,
        supplier_id: s.id,
        company_name: s.company_name,
        contact_name: s.contact_name,
        email: s.email,
        match_score: score,
        match_reasons: m?.reason ?? "Capabilities overlap with the brief.",
        source: "database",
        stage: "IDENTIFIED",
        is_partner: partnerNames.has(String(s.company_name).toLowerCase()),
      });
    }
    for (const c of competitorComans) {
      rows.push({
        user_id: userId,
        campaign_id: data.campaignId,
        supplier_id: null,
        company_name: c.company,
        contact_name: c.contact,
        email: c.email,
        match_score: 60,
        match_reasons: `Competitor co-manufacturer — ${c.reason}`,
        source: "competitor",
        stage: "IDENTIFIED",
        is_partner: false,
      });
    }
    if (rows.length) {
      const { error } = await supabase.from("campaign_suppliers").insert(rows);
      if (error) throw new Error(error.message);
    }
    await supabase.from("campaigns").update({ status: "SCORED" }).eq("id", data.campaignId);
    return { count: rows.length };
  });

// ---------- UPGRADE ----------
export const upgradeCampaign = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { campaignId: string }) => d)
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("campaigns").update({ plan: "Pro", upgraded: true, status: "ACTIVE" })
      .eq("id", data.campaignId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ---------- LAUNCH OUTREACH ----------
export const launchOutreach = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { campaignId: string }) => d)
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: campaign } = await supabase.from("campaigns").select("*").eq("id", data.campaignId).single();
    if (!campaign) throw new Error("Campaign not found");
    if (!campaign.upgraded) throw new Error("Upgrade required before outreach.");

    const { data: targets } = await supabase
      .from("campaign_suppliers").select("*").eq("campaign_id", data.campaignId).eq("stage", "IDENTIFIED");
    const cs = (targets ?? []) as Array<Record<string, unknown>>;
    let sent = 0;
    for (const t of cs) {
      let subject = `Co-manufacturing inquiry — ${campaign.product}`;
      let body = `Hi ${t.contact_name ?? "there"},\n\nWe're sourcing a partner for ${campaign.product} and your capabilities look like a strong fit. Would you be open to a quick conversation?\n\nBest,\nAekovera Sourcing`;
      try {
        const out = await callAI([
          { role: "system", content: "You are Aekovera's sourcing agent. Write a short, warm, personalized B2B outreach email (90-130 words) to a potential co-manufacturer. Reference their specific capabilities and the client's needs. Friendly, concrete, no fluff. Do NOT mention the client's brand name." },
          { role: "user", content: `Supplier: ${t.company_name} (${t.contact_name}). Their match reason: ${t.match_reasons}.\nBrief:\n${briefText(campaign)}\n\nReturn ONLY JSON: {"subject":"...","body":"..."}` },
        ], { json: true });
        const parsed = safeJson<{ subject: string; body: string }>(out, { subject, body });
        subject = parsed.subject || subject;
        body = parsed.body || body;
      } catch (e) {
        if (e instanceof Error && (e.message === "RATE_LIMIT" || e.message === "CREDITS")) throw e;
      }
      await supabase.from("messages").insert({
        user_id: userId, campaign_supplier_id: t.id, direction: "outbound", subject, body,
      });
      await supabase.from("campaign_suppliers").update({ stage: "CONTACTED" }).eq("id", t.id);
      if (t.supplier_id) {
        await supabase.from("suppliers").update({ last_contacted: new Date().toISOString().slice(0, 10) }).eq("id", t.supplier_id);
      }
      sent++;
    }
    await supabase.from("campaigns").update({ status: "OUTREACH_SENT" }).eq("id", data.campaignId);
    return { sent };
  });

// ---------- RECORD REPLY (classify + branch) ----------
export const recordReply = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { campaignSupplierId: string; replyText: string }) => d)
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: cs } = await supabase.from("campaign_suppliers").select("*").eq("id", data.campaignSupplierId).single();
    if (!cs) throw new Error("Supplier not found in campaign");
    const { data: campaign } = await supabase.from("campaigns").select("*").eq("id", cs.campaign_id).single();

    // classify
    let classification: "Yes" | "No" | "Maybe" = "Maybe";
    let concern = "";
    let training: { can_do?: string; cannot_do?: string } = {};
    try {
      const out = await callAI([
        { role: "system", content: "Classify a supplier's email reply to a sourcing inquiry as YES (can do it / interested), NO (cannot do / not interested), or MAYBE (needs more info). Extract any concern/question, and any capability facts to record." },
        { role: "user", content: `Reply:\n"""${data.replyText}"""\nReturn ONLY JSON: {"classification":"Yes|No|Maybe","concern":"<their main question or reason, brief>","can_do":"<capabilities they confirmed, or empty>","cannot_do":"<things they said they can't do, or empty>"}` },
      ], { json: true });
      const p = safeJson<{ classification: string; concern: string; can_do: string; cannot_do: string }>(out, { classification: "Maybe", concern: "", can_do: "", cannot_do: "" });
      const c = (p.classification || "").toLowerCase();
      classification = c.startsWith("y") ? "Yes" : c.startsWith("n") ? "No" : "Maybe";
      concern = p.concern || "";
      training = { can_do: p.can_do, cannot_do: p.cannot_do };
    } catch (e) {
      if (e instanceof Error && (e.message === "RATE_LIMIT" || e.message === "CREDITS")) throw e;
    }

    // store inbound message
    await supabase.from("messages").insert({
      user_id: userId, campaign_supplier_id: cs.id, direction: "inbound",
      subject: "Re: outreach", body: data.replyText, classification,
    });
    await supabase.from("campaign_suppliers").update({ stage: "RESPONDED", response: classification }).eq("id", cs.id);

    // train the supplier database
    if (cs.supplier_id && (training.can_do || training.cannot_do)) {
      const upd: Record<string, unknown> = { last_response: classification };
      if (training.can_do) upd.can_do = training.can_do;
      if (training.cannot_do) upd.cannot_do = training.cannot_do;
      await supabase.from("suppliers").update(upd).eq("id", cs.supplier_id);
    } else if (cs.supplier_id) {
      await supabase.from("suppliers").update({ last_response: classification }).eq("id", cs.supplier_id);
    }

    // BRANCH
    let agentReply = "";
    if (classification === "Yes") {
      agentReply = `Amazing — that's really good to hear. We've been looking for a partner for this. I also wanted to check: do you work with a referral commission on the order, so we can bring you this client as well as more clients as we work as their sourcing team?`;
      await supabase.from("campaign_suppliers").update({ stage: "QUALIFIED", commission_status: "asked" }).eq("id", cs.id);
    } else if (classification === "No") {
      // check form submissions
      const { data: forms } = await supabase.from("form_submissions").select("id,email,company_name")
        .or(`email.eq.${cs.email},company_name.ilike.${cs.company_name}`);
      const onFile = (forms ?? []).length > 0;
      if (onFile) {
        agentReply = `No worries at all — we have you on file. We'll definitely keep sending you the right clients. You can update your details anytime so we match you even better.`;
      } else {
        agentReply = `Totally understand. Could you fill out our quick capabilities form so we understand what's a good fit and can send the right clients your way going forward?`;
      }
      await supabase.from("campaign_suppliers").update({ stage: "REJECTED" }).eq("id", cs.id);
    } else {
      // MAYBE
      agentReply = `Happy to help. What exactly do you need from us to confirm fit? I'll batch this with the client and come back with clear answers.`;
      // create / update an escalation grouping the client questions (anonymized)
      await supabase.from("escalations").insert({
        user_id: userId,
        campaign_id: cs.campaign_id,
        campaign_supplier_id: cs.id,
        reason: "MAYBE — client info needed",
        context: `A supplier asked: "${concern || data.replyText}". Batch with other maybes and send to ${campaign?.brand ?? "the client"} WITHOUT revealing supplier names.`,
        status: "OPEN",
      });
    }
    if (agentReply) {
      await supabase.from("messages").insert({
        user_id: userId, campaign_supplier_id: cs.id, direction: "outbound", subject: "Re: your reply", body: agentReply,
      });
    }
    return { classification, concern };
  });

// ---------- COMMISSION RESPONSE (YES branch continued) ----------
export const setCommissionResponse = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { campaignSupplierId: string; agreed: boolean }) => d)
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: cs } = await supabase.from("campaign_suppliers").select("*").eq("id", data.campaignSupplierId).single();
    if (!cs) throw new Error("Not found");
    const { data: campaign } = await supabase.from("campaigns").select("brand").eq("id", cs.campaign_id).single();

    if (data.agreed) {
      const reply = `Wonderful. I'll bring in a member of the Aekovera team to take this forward in detail — it'll be great if you can schedule a time here so we can discuss specifics: https://cal.aekovera.example.com/intro`;
      await supabase.from("messages").insert({ user_id: userId, campaign_supplier_id: cs.id, direction: "outbound", subject: "Next steps", body: reply });
      await supabase.from("campaign_suppliers").update({ commission_status: "agreed", stage: "NEGOTIATING", escalated: true }).eq("id", cs.id);
      await supabase.from("escalations").insert({
        user_id: userId, campaign_id: cs.campaign_id, campaign_supplier_id: cs.id,
        reason: "YES + commission agreed — human handoff",
        context: `${cs.company_name} said yes and agreed to the referral commission. A human should take over the call and contract discussion with ${campaign?.brand ?? "the client"}.`,
        status: "OPEN",
      });
    } else {
      // check partner DB
      const { data: partner } = await supabase.from("partners").select("id").ilike("company_name", cs.company_name).maybeSingle();
      const reply = partner
        ? `No problem at all — great to keep working together. We'll line up the details and the client introduction.`
        : `Okay, no problem. We'd love to see if you can do this, and we can figure out the referral commission later.`;
      await supabase.from("messages").insert({ user_id: userId, campaign_supplier_id: cs.id, direction: "outbound", subject: "Sounds good", body: reply });
      await supabase.from("campaign_suppliers").update({ commission_status: partner ? "partner" : "declined", stage: "NEGOTIATING" }).eq("id", cs.id);
    }
    return { ok: true };
  });
