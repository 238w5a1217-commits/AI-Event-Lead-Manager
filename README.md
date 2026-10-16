# AI Event Lead Manager

A production-grade, event-focused Lead Management Application built with Next.js App Router, MongoDB Atlas, Google Gemini AI, responsive Tailwind CSS, and Lucide icons.

[![Stack](https://img.shields.io/badge/Stack-Next.js%20%7C%20React%20%7C%20TypeScript%20%7C%20Node.js-007acc?style=flat-square)](https://nextjs.org/)
[![Database](https://img.shields.io/badge/Database-MongoDB%20Atlas%20%7C%20Mongoose-47a248?style=flat-square)](https://www.mongodb.com/atlas)
[![AI](https://img.shields.io/badge/AI-Google%20Gemini%20API-8e24aa?style=flat-square)](https://ai.google.dev/)
[![Styling](https://img.shields.io/badge/Styling-Tailwind%20CSS-06b6d4?style=flat-square)](https://tailwindcss.com/)
[![Icons](https://img.shields.io/badge/Icons-Lucide--React-f59e0b?style=flat-square)](https://lucide.dev/)

---

## 📌 Overview

When attending conferences, summits, and trade shows, capturing contacts quickly is only half the battle — following up with relevant context before conversations go cold is where most opportunities are won or lost.

**AI Event Lead Manager** is built to solve this problem. It gives sales teams, founders, and event representatives a single place to log booth conversations, track follow-up progress, and use Google Gemini AI to instantly turn rough meeting notes into actionable executive summaries and personalized, ready-to-send follow-up emails.

---

## ✨ Features

- **Lead Pipeline Management**: Full CRUD operations (Add, Edit, Delete, View) connected directly to a cloud MongoDB Atlas cluster.
- **Gemini AI Notes Summarizer**: Condenses long interaction notes into crisp 2-sentence executive briefings highlighting lead needs and recommended next steps.
- **Gemini AI Email Drafter**: Automatically composes warm, personalized follow-up emails referencing specific discussion points from the event, with one-click copy and direct `mailto:` links.
- **Dual Dashboard Views**:
  - **3-Column Card Grid**: Ideal for reviewing notes, contact details, tags, and triggering AI actions.
  - **Compact Spreadsheet Table**: Dense layout designed for rapid scanning, inline status updates, and note previews.
- **Steady Pipeline Analytics**: A 5-card KPI summary (Total Leads, Needs Follow-Up, In Conversation, Followed Up, Follow-up Rate) that maintains a constant baseline count while filtering.
- **Custom Status Selector**: Single-line compact status pills with a custom popover menu (amber, sky, emerald, slate) replacing clunky browser-native selects.
- **Live Search & Event Filtering**: Fast filtering by contact name, company, email, notes, specific event, or pipeline stage.

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Framework** | [Next.js](https://nextjs.org/) (App Router) | Full-stack React framework with serverless API routes |
| **Language** | [TypeScript](https://www.typescriptlang.org/) | Type safety across client components and backend models |
| **Database** | [MongoDB Atlas](https://www.mongodb.com/atlas) + [Mongoose](https://mongoosejs.com/) | Cloud document persistence with schema validation & indexing |
| **AI Integration** | [Google Gemini API](https://ai.google.dev/) (`@google/generative-ai`) | Notes summarization and personalized follow-up generation |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) | Clean, responsive light-slate UI tailored for human productivity |
| **Icons** | [Lucide React](https://lucide.dev/) | Clean, consistent icons across actions and status indicators |

---

## 🗂️ Folder Structure

```text
event/
├── .env.example                  # Template for environment variables
├── .env.local                    # Atlas MongoDB URI & Gemini API key (git-ignored)
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── ai/
│   │   │   │   └── route.ts      # POST: Gemini AI notes summarization & email drafting
│   │   │   └── leads/
│   │   │       ├── route.ts      # GET (search, filter, pagination) & POST (create lead)
│   │   │       └── [id]/
│   │   │           └── route.ts  # GET, PUT (update status/fields), DELETE lead
│   │   ├── globals.css           # Clean slate styling & custom scrollbars
│   │   ├── layout.tsx            # Inter typography & application metadata
│   │   └── page.tsx              # Main dashboard (steady KPI metrics, filters, view switcher)
│   ├── components/
│   │   ├── StatsBar.tsx          # Real-time pipeline KPI metrics (constant baseline)
│   │   ├── LeadCard.tsx          # 3-column responsive lead card with meeting notes & AI
│   │   ├── LeadTable.tsx         # Clean spreadsheet view with inline status & copy tools
│   │   ├── LeadForm.tsx          # Modal dialog for creating and editing leads
│   │   └── StatusDropdown.tsx    # Compact single-line status popover selector
│   ├── lib/
│   │   └── mongodb.ts            # Mongoose connection with DNS-over-HTTPS (DoH) fallback
│   ├── models/
│   │   └── Lead.ts               # Mongoose schema with text indexes & validations
│   └── types/
│       └── index.ts              # TypeScript interfaces for leads and API responses
├── package.json
└── README.md
```

---

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/238w5a1217-commits/AI-Event-Lead-Manager.git
cd AI-Event-Lead-Manager
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env.local` or create `.env.local` in the project root:
```env
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/event_leads?retryWrites=true&w=majority
GEMINI_API_KEY=your_gemini_api_key_here
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📡 API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/leads` | Retrieve leads with optional search, status filter, event filter, and pagination |
| `POST` | `/api/leads` | Create a new lead contact record |
| `GET` | `/api/leads/:id` | Fetch a single lead by its MongoDB ID |
| `PUT` | `/api/leads/:id` | Update lead fields, interaction notes, or follow-up status |
| `DELETE` | `/api/leads/:id` | Remove a lead from the database |
| `POST` | `/api/ai` | Trigger Gemini AI (`action: 'summarize'` or `'draft'`) on lead notes |

---

## 💡 Engineering Highlights

### 🛡️ DNS-over-HTTPS (DoH) MongoDB Atlas Resolver
Connecting to MongoDB Atlas on Windows often runs into `querySrv ECONNREFUSED` because local ISPs and router firewalls block standard UDP port 53 DNS SRV lookups. 
In `src/lib/mongodb.ts`, we implemented an automatic fallback using **DNS-over-HTTPS (DoH)** via Google Public DNS over standard HTTPS port 443. If an SRV refusal occurs, the app automatically resolves the cluster shard hostnames and reconnects via standard replica-set URIs with zero manual configuration.

### 🤖 Resilient Gemini Multi-Model Fallback Chain
Google Gemini models occasionally experience temporary `503 Service Unavailable` spikes during high global demand. The `/api/ai` route implements an intelligent fallback chain (`gemini-3.5-flash` → `gemini-3.5-flash-lite` → `gemini-3-flash-preview` → `gemini-2.5-flash`) that transparently catches transient errors and retries the prompt on the next available model, ensuring reliable summaries and email drafts every time.

### 📊 Steady Metrics Baseline
When filtering by event or status, traditional dashboards often recalculate total pipeline metrics based only on the filtered slice, confusing users about overall progress. This dashboard keeps `allLeads` as the single source of truth for the top KPI metric bar and status count badges, while deriving a clean filtered list for display.

---

## 📄 License
This project is open source and available under the [MIT License](LICENSE).
