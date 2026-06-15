# Aekovera Sourcing Agent

An AI-powered sourcing platform that automates the journey from **client brief to supplier qualification and human handoff** for CPG brands.

The platform acts as an autonomous operations manager, helping brands discover, evaluate, and engage co-manufacturers, co-packers, and ingredient suppliers.

---

## Problem Statement

Consumer Packaged Goods (CPG) brands often spend weeks manually sourcing manufacturing partners through emails, spreadsheets, and repeated follow-ups.

The traditional process involves:

* Identifying suitable suppliers
* Comparing capabilities
* Sending outreach emails
* Managing supplier responses
* Gathering missing information
* Coordinating meetings
* Tracking deal progress

Aekovera automates this workflow using AI.

---

## Key Features

### Smart Supplier Matching

* Analyzes client briefs using Gemini AI
* Scores suppliers against capabilities, certifications, MOQ, region, and product requirements
* Surfaces top matches with reasoning
* Identifies competitor co-manufacturers for additional outreach

### AI Outreach Engine

* Generates personalized supplier outreach emails
* Creates and maintains conversation threads
* Tracks outreach status for every supplier

### Intelligent Response Handling

Automatically classifies supplier responses into:

* YES
* NO
* MAYBE

Each branch triggers different workflows.

### Dynamic Workflow Automation

**YES**

* Checks existing partner status
* Initiates referral commission discussion
* Escalates qualified suppliers to a human

**NO**

* Requests capability form completion
* Updates supplier capability records
* Trains the supplier database

**MAYBE**

* Collects information requests
* Batches and de-duplicates supplier questions
* Requests clarification from clients
* Re-engages suppliers with updated information

### Pipeline Management

Track suppliers through the complete sourcing lifecycle:

```text
IDENTIFIED → CONTACTED → RESPONDED → QUALIFIED
                      ↘ REJECTED
QUALIFIED → NEGOTIATING → FINALIZED
```

### Human Handoff Center

Escalates suppliers when:

* Commission discussions are required
* Complex negotiations arise
* Edge cases occur
* No progress is made within defined timeframes

### Analytics Dashboard

Monitor:

* Response rates
* YES / NO / MAYBE distribution
* Conversion rates
* Supplier performance
* Campaign outcomes

---

## Agent Workflow

```text
Client Brief
      ↓
Supplier Scoring
      ↓
Upgrade Gate
      ↓
Supplier Outreach
      ↓
Supplier Response
      ↓
 ┌───────┬────────┬─────────┐
 │ YES   │  NO    │ MAYBE  │
 └───────┴────────┴─────────┘
     ↓        ↓         ↓
Commission  Update   Collect Questions
Discussion  Database     ↓
     ↓        ↓      Client Clarification
Human       Train         ↓
Handoff   Capabilities  Re-engage Supplier
     ↓                    ↓
Contract & Partnership
```

---

## Tech Stack

### Frontend

* React
* TanStack Start
* TypeScript

### Backend

* Lovable Cloud
* Server Functions (`createServerFn`)

### Database

* PostgreSQL
* Row Level Security (RLS)

### AI

* Gemini 3 Flash Preview

### Authentication

* Lovable Auth

### State Management

* TanStack Router
* TanStack Query

### Analytics & Visualization

* Recharts

---

## Data Model

The platform is seeded using the provided sourcing datasets.

### Core Entities

* `partners`
* `suppliers`
* `form_submissions`
* `campaigns`
* `campaign_suppliers`
* `messages`
* `escalations`

---

## Application Routes

| Route            | Description            |
| ---------------- | ---------------------- |
| `/`              | Product overview       |
| `/auth`          | Sign in / Sign up      |
| `/dashboard`     | Campaign overview      |
| `/campaigns/new` | Create sourcing brief  |
| `/campaigns/:id` | Campaign workspace     |
| `/suppliers`     | Supplier database      |
| `/partners`      | Partner database       |
| `/forms`         | Capability submissions |
| `/escalations`   | Human handoff center   |
| `/analytics`     | Performance metrics    |

---

## AI Services

### `scoreCampaign`

* Scores suppliers against client requirements
* Returns rankings and explanations
* Suggests competitor co-manufacturers

### `generateOutreach`

* Creates personalized supplier emails

### `classifyResponse`

* Categorizes supplier replies
* Extracts concerns and missing information
* Identifies capability mismatches

### `runBranch`

Executes business logic for:

* YES workflow
* NO workflow
* MAYBE workflow

Updates database state automatically.

---

## Security

* Row Level Security (RLS) enabled on all tables
* User-scoped campaigns and supplier interactions
* Secure server-side AI execution
* Protected access to campaign data

---

## Development Roadmap

### Phase 1

* Database schema
* Authentication
* Dummy data import

### Phase 2

* Campaign creation
* Supplier scoring

### Phase 3

* Outreach generation
* Message threads

### Phase 4

* Response classification
* Branch workflows

### Phase 5

* Pipeline management
* Human escalation center

### Phase 6

* Analytics dashboard

---

## Future Enhancements

* Gmail integration
* Resend integration
* Calendar scheduling
* CRM integrations
* Real-time notifications
* Supplier portal
* Contract management
* Automated NDA workflows
* Multi-agent orchestration
* Predictive supplier recommendations

---

## Local Development

```bash
npm install

npm run dev
```

Open:

```text
http://localhost:3000
```

---

## Demo Scenario

The application includes seeded dummy data demonstrating a complete sourcing workflow:

1. Upload a client brief
2. Review supplier scores
3. Trigger outreach
4. Process YES / NO / MAYBE responses
5. Observe database training
6. Escalate qualified suppliers
7. Track progress to finalization

---

## Disclaimer

This project is built as part of the Aekovera Sourcing Agent challenge using the provided dummy datasets.

All sample supplier, partner, and campaign information is fictional and intended solely for demonstration purposes.
