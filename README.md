**LifeOps AI — Personal Operations Agent**

AI prepares. Humans approve. Every important action is auditable.

LifeOps AI is a hackathon prototype for turning fragmented administrative tasks into one structured, reviewable workflow.

Instead of only answering questions, the prototype demonstrates an operations workflow that can understand a user's goal, organize relevant information, verify consistency, evaluate deterministic eligibility rules, prepare an application, pause for explicit human approval, perform a controlled mock execution, and record the workflow in an audit trail.

Core Workflow

USER GOAL
   ↓
PLAN
   ↓
DOCUMENTS
   ↓
VERIFY
   ↓
ELIGIBILITY
   ↓
PREPARE APPLICATION
   ↓
HUMAN APPROVAL
   ↓
CONTROLLED MOCK EXECUTION
   ↓
AUDIT TRAIL

What the Current Prototype Demonstrates

Goal-driven agent workflow orchestration

Personal document workspace / Document Vault

Structured demo document data and simulated extraction flow

Cross-document consistency verification

Missing/conflicting information detection

Deterministic eligibility evaluation

Prototype opportunity discovery using seeded/demo records

Application draft preparation from verified profile information

Field-level data provenance

Privacy-aware data minimization and sensitive-value masking

Human field-level approval and final declaration

Centralized submission guard

Idempotent mock/sandbox submission adapter

Cryptographically linked audit events with SHA-256 hashing

User-scoped browser persistence for the prototype

English / Tamil / Hindi interface localization support

Demo A: mismatch case

Demo B: clean case

Important Prototype Disclosure

This repository contains a hackathon prototype, not a production government-service platform.

The current demo uses local/browser persistence and simulated or seeded data where external integrations are not connected. In particular:

Document/OCR processing shown in the demo is simulated/prototype behavior.

Opportunities are seeded/demo records and are not a live synchronized opportunity database.

The application execution flow uses a Mock/Sandbox Submission Provider.

No real government portal is submitted to from this prototype.

The current agent workflow uses local/deterministic orchestration; a production LLM infrastructure layer is a future architecture option.

Supabase schema/RLS integration is included as architecture for future backend deployment, but the current demo may operate through the local fallback when Supabase environment variables are not configured.

Production-grade authentication, encrypted document storage, external API integrations, and live portal automation are outside the current prototype scope.

The prototype is designed to demonstrate the product architecture and governance model honestly without pretending that future integrations are already live.

Key Product Ideas

1. Goal-driven workflow

A user can start with a natural-language administrative goal, such as:

"Find a student support opportunity I qualify for and prepare the application for my review."

LifeOps converts the goal into a structured workflow rather than leaving the user with a chatbot response.

2. Cross-document verification

The verification engine compares structured information from available demo documents and surfaces inconsistencies instead of silently choosing a value.

The demo includes a mismatch case such as:

Aadhaar       → Arun Kumar
Marksheet     → Arun Kumar
Bank          → Arun Kumar
Income Cert.  → Arun Kumarr

The discrepancy can be acknowledged and remains visible in the workflow/audit history.

3. Deterministic eligibility

Opportunity criteria are evaluated against the available structured profile data.

The demo can evaluate criteria such as:

age range

family income

Tamil Nadu domicile

academic score

The UI exposes the requirement, actual value, and evaluation result.

4. Privacy and data minimization

LifeOps is designed around the principle that an application should use only information required for its purpose.

For example, if PAN is not required for a particular demo workflow, it should not be unnecessarily passed into the application-preparation context.

Sensitive values such as Aadhaar and bank account numbers are masked in appropriate UI contexts.

5. Human approval

LifeOps does not silently execute sensitive application actions.

Before the controlled execution step, the user reviews the prepared fields, their provenance, and the final declaration.

The submission guard requires the necessary approval conditions before mock execution can proceed.

6. Auditability

Important workflow actions are recorded as linked audit events.

The prototype includes integrity verification for the audit chain and a tamper-test demonstration.

Technology

React 18

TypeScript

Vite

React Router

Lucide React

Browser/local persistence for the prototype

Optional Supabase architecture and PostgreSQL/RLS schema

Web Crypto SHA-256 hashing / compatible local SHA-256 fallback

Project Structure

src/
├── components/       UI components and layout
├── context/          Notifications and localization
├── data/             Demo documents, applications and opportunities
├── engine/            Agent, auth, privacy, verification and eligibility logic
├── lib/               Supabase client configuration
├── pages/             Product workflow screens
├── services/          Backend and mock submission adapters
├── tests/             Automated prototype checks
├── utils/             Storage, comparison and audit utilities
└── types/             Shared TypeScript models

supabase/
└── schema.sql        Future/backend database schema and RLS policies

Local Development

npm install
npm run dev

Open the local Vite URL shown in the terminal, normally:

http://localhost:5173/

Validation

Run the automated prototype checks:

npm run test

Run TypeScript validation:

npm run lint

Build the production bundle:

npm run build

The final prototype should pass the automated checks and produce a successful Vite build before deployment.

Demo Scenarios

Demo A — Name Mismatch

Demonstrates:

Documents
   ↓
Cross-document comparison
   ↓
Name discrepancy detected
   ↓
User acknowledgement
   ↓
Audit event
   ↓
Workflow continues when the discrepancy is non-critical

Demo B — Clean Case

Demonstrates:

Verified information
   ↓
Eligibility passes
   ↓
Application draft
   ↓
Human field approval
   ↓
Human declaration
   ↓
Mock submission
   ↓
Audit trail

Future / Production Architecture

The submitted concept is designed to scale beyond the current prototype.

Future production work can include:

FastAPI/Flask backend services

PostgreSQL-backed application state

OAuth / production identity management

encrypted document storage

real OCR/document intelligence

LLM-powered planning and reasoning

authoritative opportunity feeds

external application/portal APIs

production cloud deployment

stronger server-side audit and authorization controls

These are future architecture items, not claims that the current hackathon prototype already provides those live integrations.

Hackathon Demo

The current prototype is intended to demonstrate the following product principle:

From finding an opportunity to safely preparing and completing the application — with verification, human approval, and auditability built into the workflow.
