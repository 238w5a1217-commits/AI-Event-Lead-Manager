# 🎯 EventLead Manager — AI-Powered Event Lead Pipeline

A clean, modern full-stack CRM application designed specifically for business professionals and event teams to capture contacts, track follow-ups, and leverage Gemini AI to summarize interaction notes and draft tailored follow-up messages.

---

## 🌟 Key Capabilities

- **Natural, Human-First UI**: Clean, modern SaaS design inspired by tools like Linear, Stripe, and Attio — no pitch-black artificial templates or distracting glow effects.
- **MongoDB Atlas Persistence**: Complete CRUD operations (Add, Edit, Delete, Search, and Filter) with direct cloud database connectivity.
- **AI-Powered Notes Summary**: Gemini AI condenses detailed interaction notes into a crisp 2-sentence executive briefing.
- **AI Follow-up Email Drafting**: Gemini drafts personalized follow-up emails referencing conversation details with instant one-click copy or direct `mailto:` launch.
- **Dual View Modes**: Switch between **Card View** (great for browsing notes and AI actions) and **Spreadsheet Table View** (great for quick multi-lead scanning).
- **Fast Search & Event Filtering**: Live debounced search across contact name, company, email, notes, and filter by event or status tab.
- **Demo Data Seeder**: Built-in 1-click sample data loader to test functionality immediately.

---

## 🗂️ Project Architecture & Folder Structure

```
event/
├── .env.local                    # Atlas MongoDB connection string & Gemini API key
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── leads/
│   │   │   │   ├── route.ts      # GET (search, filter, pagination) & POST (create lead)
│   │   │   │   └── [id]/route.ts # GET, PUT (update fields & status), DELETE lead
│   │   │   ├── ai/
│   │   │   │   └── route.ts      # POST: Gemini AI summarize & email drafting
│   │   │   └── seed/
│   │   │       └── route.ts      # POST: 1-click sample event leads loader
│   │   ├── globals.css           # Clean slate styling, custom scrollbars
│   │   ├── layout.tsx            # Inter typography and application metadata
│   │   └── page.tsx              # Main interactive dashboard with view toggles
│   ├── components/
│   │   ├── StatsBar.tsx          # Real-time pipeline KPI metrics
│   │   ├── LeadCard.tsx          # Interactive card with inline status & AI tools
│   │   ├── LeadTable.tsx         # Clean spreadsheet view for fast review
│   │   └── LeadForm.tsx          # Modal dialog for capturing & editing contacts
│   ├── lib/
│   │   └── mongodb.ts            # Mongoose connection singleton with custom DNS fix
│   ├── models/
│   │   └── Lead.ts               # Mongoose schema with text indexes
│   └── types/
│       └── index.ts              # TypeScript definitions for leads and forms
└── README.md
```

---

## 🚀 Setup & Running Locally

### 1. Environment Configuration
Create or verify `.env.local` in the project root:
```env
MONGODB_URI=
GEMINI_API_KEY=your_gemini_api_key
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Run Development Server
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 💡 Key Design & Technical Decisions

1. **Natural Human-Centric UI**:
   - Replaced artificial dark-mode aesthetics with a crisp, accessible light-slate palette (`bg-slate-50`, `bg-white` cards with `border-slate-200`).
   - Clear typography hierarchy using Inter.
   - Status indicators use natural semantic tones: Amber for Needs Follow-up, Blue for In Conversation, Emerald for Followed Up.


2. **Gemini 2.5 Flash Integration**:
   - Uses the latest high-speed `gemini-2.5-flash` model.
   - Custom prompts ensure output is authentic, professional, and ready to send without robotic boilerplate.

3. **Spreadsheet Table & Card View Flexibility**:
   - Supports both detailed card browsing and compact spreadsheet scanning based on user preference.
