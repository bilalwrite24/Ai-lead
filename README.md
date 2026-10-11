# LeadFit AI — B2B Prospect List Qualification Engine

LeadFit AI is a responsive, privacy-first B2B SaaS web application designed for freelance lead generators, SDR consultants, and small B2B sales agencies. It empowers sales operators to qualify and score existing prospect lists against a client's Ideal Customer Profile (ICP) using transparent, deterministic rules.

---

## 🌟 Product Highlights

- **Deterministic, Rules-Based Scoring**: Objective scoring model from 0 to 100 based on exact ICP constraints (Industry, Job Title & Seniority, Employee Headcount, Geography, and Company Model). Zero black-box hallucinations.
- **Auditable Justifications**: Every prospect includes a transparent breakdown explaining why each criterion matched, partially matched, was missing from the record, or mismatched. Missing data is never penalized as a false mismatch.
- **Client-Side Data Privacy**: CSV parsing, deduplication, and scoring execute entirely within browser memory. Prospect contact information is never transmitted to external third-party services.
- **Flexible Column Mapping & Deduplication**: Auto-detects columns from Apollo, ZoomInfo, LinkedIn Sales Navigator, Clay, or custom scrapers. Automatically flags duplicate rows via normalized email or company-and-contact pairs.
- **Actionable AI Outreach Drafts**: Prepares contextual outreach email drafts using proven B2B sales frameworks (Problem-Agitate-Solve, Direct Value, Peer Case Study, Quick Question) with token substitution. Clearly labeled as drafts with no automated sending.
- **CSV Export & Audit Archive**: Export filtered Qualified leads or complete scored batches with all breakdown columns. Archive batches to local storage for future reference.

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (version 18 or higher)
- npm or yarn

### Local Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/leadfit-ai.git
   cd leadfit-ai
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```
   Open your browser and navigate to `http://localhost:3000`.

4. **Build for production**:
   ```bash
   npm run build
   ```

---

## 📊 How the Scoring Engine Works

LeadFit AI uses a weighted scoring matrix that evaluates prospects across five core dimensions:

| Criterion | Default Weight | Match Criteria | Missing Data Handling |
| :--- | :--- | :--- | :--- |
| **Industry** | 25% | Exact or semantic token match with target vertical | Neutral score applied (unconfirmed) |
| **Job Title** | 25% | Leadership seniority and functional role alignment | Neutral score applied (unconfirmed) |
| **Headcount** | 20% | Within `min` and `max` employee boundaries (with 25% tolerance buffer) | Neutral score applied (unconfirmed) |
| **Country** | 15% | Standardized nation/region match | Neutral score applied (unconfirmed) |
| **Company Type** | 15% | Target business model (B2B SaaS, Agency, VC Funded, etc.) | Neutral score applied (unconfirmed) |

### Status Classifications:
- **Qualified** (Score ≥ 70): High compatibility across core criteria; approved for outreach.
- **Needs Review** (Score 40–69): Borderline parameters or missing fields requiring SDR human verification.
- **Not Qualified** (Score < 40): Significant mismatch with client ICP parameters.

*Note: LeadFit AI never claims that an email or business has been independently verified by an external clearinghouse.*

---

## 🚢 Deployment Steps

### Deploy to Vercel

LeadFit AI is built with Vite and React, making deployment to Vercel effortless:

1. Push your repository to **GitHub**.
2. Go to [Vercel](https://vercel.com) and click **"New Project"**.
3. Import your GitHub repository.
4. Set the build settings:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Click **Deploy**.

---

## 🔒 Privacy & Reliability

- **No Remote Data Storage**: Uploaded prospect CSVs are parsed locally in browser memory.
- **Fictional Sample Records**: The downloadable demonstration file contains synthetic sample records clearly tagged as fictional for auditing purposes.
- **No Telemetry of PII**: Personal lead data is never logged to the browser console.

---

## 📝 License

This project is licensed under the Apache 2.0 License.
