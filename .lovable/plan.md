# Aekovera Sourcing Agent — Web App Plan

Your uploaded docs describe a Python/FastAPI/Streamlit/LangGraph stack. This Lovable environment runs on **TanStack Start (React) + Lovable Cloud (Postgres/auth) + Lovable AI (Gemini)**. I'll recreate the exact *product behavior and agent flow* on this modern stack — not the literal Python services. The three dummy spreadsheets become the seed data and define the schema.

## What the app does (the agent flow)
1. **Brief upload** → brand uploads a sourcing brief (like the Northbarn Snacks order).
2. **Scoring** → AI scores every supplier in the database against the brief; shows top matches + "a few more on the side."
3. **Upgrade gate** → free plan; prompt to upgrade (~$20, simulated) before outreach starts.
4. **Outreach** → AI generates personalized emails to top suppliers, plus identifies competitors' co-manufacturers to email.
5. **Response classification** → each reply classified YES / NO / MAYBE, with branch logic:
   - **YES** → warm reply + ask about referral commission. If they agree → pull in a human + send a scheduling link. If they decline → check Partner DB; only raise commission if not already a partner.
   - **NO** → ask them to fill the capabilities form; check Form Submissions first ("we have you on file"); update the supplier's Can Do / Cannot Do so they aren't re-emailed (database training).
   - **MAYBE** → collect the questions, batch them, email the client anonymized (no supplier names), chase the client, then take answers back to suppliers.
6. **Pipeline** → IDENTIFIED → CONTACTED → RESPONDED → QUALIFIED/REJECTED → NEGOTIATING → FINALIZED.
7. **Escalation** → human-handoff center for YES+commission and complex cases.
8. **Analytics** → response rate, YES/NO/MAYBE breakdown, conversion, per-campaign metrics.

## Tech approach
- **Backend**: Lovable Cloud (Postgres). All AI + writes via `createServerFn`.
- **AI**: Lovable AI (`google/gemini-3-flash-preview`) for scoring, email generation, and reply classification — real AI, not mocked.
- **Email**: simulated/recorded in the database (full thread per supplier). Real sending (Resend/Gmail) can be wired later.
- **Auth**: included — users sign in and own their campaigns.

## Data model (from your spreadsheets)
- `partners` — signed referral agreement + NDA (Partner ID, company, contact, email, supplier type, categories, capabilities, fill type, certs, equipment, MOQ, capacity, region, commission %, NDA signed, agreement date, notes).
- `suppliers` — main outreach pool (Supplier ID, company, contact, email, type, categories, claimed capabilities, fill type, certs, equipment, MOQ, region, in_database, form_filled, last_contacted, last_response, can_do, cannot_do).
- `form_submissions` — capabilities form (date, company, contact, email, type, products, equipment, certs, fill type, MOQ, capacity, region, open_to_commission, notes).
- `campaigns` — brief/order (order id, brand, contact, product, category, volume, packaging, tech requirements, certs, launch, budget notes, competitor refs, plan/upgraded, status).
- `campaign_suppliers` — per-campaign supplier state: match score, pipeline stage, response, commission status, escalation flag.
- `messages` — email threads per campaign-supplier (direction, subject, body, classification).
- `escalations` — human-handoff queue with context + resolution.
- All tables RLS-scoped to the owning user, with proper GRANTs. Seeded from the dummy data.

## Pages / routes
- `/` — landing/overview of the product.
- `/auth` — sign in / sign up.
- `/dashboard` — campaign list + headline metrics (under `_authenticated`).
- `/campaigns/new` — upload/enter a brief.
- `/campaigns/$id` — campaign workspace: scored matches, upgrade gate, outreach launch, supplier pipeline (kanban), response classification, message threads.
- `/suppliers` — supplier database (with Can Do / Cannot Do training view).
- `/partners` — partner database.
- `/forms` — capabilities form submissions.
- `/escalations` — human handoff center.
- `/analytics` — campaign analytics & charts.

## Server functions (AI)
- `scoreCampaign` — ranks suppliers against a brief, returns scores + reasoning + competitor co-man suggestions.
- `generateOutreach` — drafts personalized emails per supplier.
- `classifyResponse` — classifies a supplier reply YES/NO/MAYBE, extracts concerns, suggests DB corrections.
- `runBranch` — applies the founder's branch logic (commission ask, form request, batched client questions, escalation), persists state, and trains the supplier record.

## Build order
1. Enable Lovable Cloud; create schema + RLS + GRANTs; seed dummy data.
2. Design system (distinct, professional B2B look) + app shell, nav, auth.
3. Dashboard + campaign creation + brief parsing.
4. AI scoring + upgrade gate.
5. Outreach generation + message threads.
6. Response classification + the YES/NO/MAYBE branch engine + DB training.
7. Pipeline (kanban), escalations, partners/suppliers/forms tables.
8. Analytics. Verify build + flows end-to-end.

## Defaults I'm assuming (tell me to change any)
- Real Lovable AI (not mocked), simulated email, auth on, full MVP scope.
- Since the flow is large, I'll build core (steps 1–6) first, then pipeline/escalation/analytics.

Approve and I'll start building.