# LifeOps AI — Intelligent Personal Document & Application Operations Agent

> **Verify your information once. Reuse it safely across applications.**

LifeOps AI is a local-first web application prototype designed to solve fragmented administrative and bureaucratic workflows (government schemes, scholarships, identity certificates, education applications, and employment forms).

Before an application is submitted, **LifeOps AI verifies whether the information across all user documents is internally consistent**, identifies potential rejection risks, prepares application forms strictly from verified document data, and requires **explicit field-level human approval** before mock submission.

---

## 1. Problem Statement

Every year, millions of citizens, students, and applicants face form rejections due to minor, preventable data discrepancies across personal identity documents:
- **Name Spelling Inconsistencies:** e.g. "Arun Kumar" on Aadhaar vs. "Arun Kumarr" on an Income Certificate.
- **Date Formatting Conflicts:** e.g. "14-07-2006" vs "14/07/2006" causing automated portal flags.
- **Unverified Data Reuse:** Manual copy-pasting of sensitive numbers into official forms leads to errors.
- **Lack of Provenance & Auditability:** No clear record of which document provided which field or who authorized the submission.

---

## 2. Solution & Core Innovation

LifeOps AI introduces a trustworthy, human-in-the-loop civic operations model:

```text
DOCUMENTS → PROFILE → CONSISTENCY CHECK → ELIGIBILITY → DRAFT APPLICATION → HUMAN APPROVAL → MOCK SUBMISSION → AUDIT TRAIL
```

### Key Pillars:
1. **Document Vault:** Local vault holding structured personal documents (Aadhaar, Marksheets, Income Certificates, Passbooks).
2. **Deterministic Consistency Engine:** Performs field-level cross-document verification, string normalization, date parsing, and edit-distance mismatch detection.
3. **Rule-Based Eligibility Engine:** Evaluates applicant document metrics against administrative scheme requirements (income ceilings, age ranges, academic thresholds, residency).
4. **Verified Application Drafting:** Auto-populates application forms using **ONLY** data from verified vault fields, preserving source provenance for every field.
5. **Field-Level Human Approval Center:** Requires explicit user verification and check-offs for every field before authorizing submission.
6. **Immutable Audit Trail:** Append-only local ledger recording all document additions, verification checks, acknowledgments, approvals, and submissions.

---

## 3. Technical Architecture

```text
                     +---------------------------------------+
                     |         Personal Document Vault       |
                     |  (Aadhaar, Marksheet, Income, Bank)   |
                     +---------------------------------------+
                                         |
                                         v
                     +---------------------------------------+
                     |    Deterministic Consistency Engine   |
                     | (Normalized Names, Dates, Levenshtein)|
                     +---------------------------------------+
                                         |
                                         v
                     +---------------------------------------+
                     |       Verified Personal Profile       |
                     |      (Full Document Provenance)        |
                     +---------------------------------------+
                                         |
                                         v
                     +---------------------------------------+
                     |     Opportunity Eligibility Engine    |
                     | (Schemes, Scholarships, Certificates) |
                     +---------------------------------------+
                                         |
                                         v
                     +---------------------------------------+
                     |      Application Draft Generator      |
                     |    (Sourced Strictly from Vault Data) |
                     +---------------------------------------+
                                         |
                                         v
                     +---------------------------------------+
                     |  Field-Level Human Approval Center    |
                     |   (Mandatory Checkboxes & Consent)    |
                     +---------------------------------------+
                                         |
                                         v
                     +---------------------------------------+
                     |            Mock Submission            |
                     |    (Ref ID: LO-2026-XXXXXX Generated) |
                     +---------------------------------------+
                                         |
                                         v
                     +---------------------------------------+
                     |        Immutable Audit Ledger         |
                     |       (Append-Only Event Records)     |
                     +---------------------------------------+
```

---

## 4. Technology Stack

- **Framework:** React 18 + TypeScript
- **Build Tool:** Vite
- **Icons:** Lucide React
- **Styling:** Custom Civic Tech Utility CSS Design System
- **Persistence:** LocalStorage (Offline, 100% Client-side)
- **Logic:** 100% Deterministic Rule Engine (No external API keys required)

---

## 5. Running Locally

### Prerequisites
- Node.js (v18 or higher)
- npm

### Installation Commands

```bash
# 1. Clone or open project directory
cd "LifeOps AI project"

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev
```

The application will be available at `http://localhost:3000`.

---

## 6. Hackathon Judge Step-by-Step Demo Flow

Follow these steps to demonstrate the complete workflow during judging:

### Scenario A — Mismatch Detection Demo
1. **Open Dashboard:** Observe 4 documents in vault, 18 fields verified, and **1 Issue Detected**.
2. **Header Switcher:** Ensure **"Demo A — Mismatch Case"** is active.
3. **Open Verification Engine:**
   - Observe the yellow warning card: `⚠ MISMATCH DETECTED: Full Name`.
   - View side-by-side comparison: Aadhaar Card (`"Arun Kumar"`) vs. Income Certificate (`"Arun Kumarr"`).
   - Read the neutral procedural recommendation.
   - Click **"Acknowledge & Continue"** to authorize drafting while preserving the audit record.

### Scenario B — Successful Clean Submission Demo
1. **Header Switcher:** Click **"Demo B — Clean Case"** in the top navigation bar.
2. **Verification Engine:** Observe all fields update to `✓ ALL FIELDS VERIFIED`.
3. **Open Opportunity Center:**
   - Review rule engine evaluation for **State Student Support Scheme** (4/4 Criteria Satisfied).
   - Click **"Create Application Draft"**.
4. **Open Applications:**
   - Inspect prepared draft fields. Notice that every field has explicit provenance tags (e.g., Source: `Aadhaar Card`, `Income Certificate`).
   - Click **"Proceed to Field-Level Approval Center"**.
5. **Approval Center:**
   - Notice the submit button is initially disabled.
   - Click **"Select All Field Approvals"** or check each field checkbox.
   - Observe sensitive field flags (`🔒 Sensitive` for Aadhaar and Bank numbers).
   - Check the declaration box: *"I have reviewed all field values above..."*.
   - Click **"Approve & Submit Application"** and confirm the modal dialog.
   - View the generated submission receipt with Reference ID `LO-2026-XXXXXX`.
6. **Open Audit Trail:**
   - Inspect the chronological append-only ledger displaying all events: `DOCUMENT_ADDED`, `VERIFICATION_RUN`, `APPLICATION_DRAFTED`, `FIELD_APPROVED`, `APPLICATION_SUBMITTED`.

---

## 7. Limitations & Prototype Boundaries

- **Simulated OCR:** Document text extraction is simulated from realistic local mock structures.
- **Mock Submission:** No real government portal or external endpoint is contacted.
- **Local Storage Data:** Prototype state persists in browser `localStorage`.
- **Fictional Data:** All names, addresses, Aadhaar numbers, and bank details are completely fictional test data.

---

## 8. Future Scope & Production Roadmap

1. **Local AI / Vision OCR Integration:** Integrate WebGPU-based Tesseract/ONNX models for zero-server document extraction.
2. **Zero-Knowledge Encryption:** Encrypt vault data locally using AES-GCM with user-held passphrase.
3. **Browser Automation Engine:** Execute client-side Playwright/Puppeteer script automations for authorized portal submissions under active user review.
4. **Multilingual Resolution:** Support regional script variations (e.g. Tamil / Hindi to English name transliteration verification).
