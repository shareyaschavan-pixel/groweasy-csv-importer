# GrowEasy AI-Powered CSV Importer

An intelligent CSV importer that uses Google Gemini AI to extract and map CRM lead information from **any CSV format** into GrowEasy CRM structure — no manual field mapping needed.

## 🚀 Live Demo

> **🌐 Hosted App:** [https://groweasy-csv-importer-ten.vercel.app](https://groweasy-csv-importer-ten.vercel.app)
>
> **⚙️ Backend API:** [https://groweasy-csv-importer-iv3p.onrender.com](https://groweasy-csv-importer-iv3p.onrender.com)

## ✨ Features

- **Drag & Drop** or file picker CSV upload
- **CSV Preview** with responsive scrollable table (sticky headers)
- **AI-powered field mapping** using Google Gemini (gemini-1.5-flash)
- **Loading overlay** with animated spinner + step-by-step messages during AI processing
- **Visible error handling** — error banner with retry button on upload/import failure
- **Batch processing** with real-time progress bar
- **Dark mode** support
- Handles **any CSV format**: Facebook Leads, Google Ads, Excel exports, Real Estate CRMs, etc.
- Skips invalid records (no email AND no mobile)
- **Retry mechanism** (3 attempts) for failed AI batches
- Docker support

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14 (App Router), TailwindCSS, TypeScript |
| Backend | Node.js, Express.js, Multer 2.x |
| AI | Google Gemini (gemini-1.5-flash) |
| Deployment | Vercel (Frontend) + Render (Backend) |

## 📁 Project Structure

```
groweasy-csv-importer/
├── frontend/                 # Next.js 14 application
│   ├── app/
│   │   ├── page.tsx          # Main UI — upload, preview, confirm, results
│   │   └── layout.tsx
│   ├── components/
│   │   ├── DropZone.tsx
│   │   ├── PreviewTable.tsx
│   │   └── ResultTable.tsx
│   ├── utils/
│   ├── types/
│   ├── .env.example
│   └── package.json
├── backend/                  # Express.js API
│   ├── src/
│   │   ├── routes/csv.js     # POST /api/parse-csv (multer 2.x)
│   │   ├── services/
│   │   └── utils/
│   ├── .env.example
│   └── package.json
├── docker-compose.yml
└── README.md
```

## ⚙️ Local Development Setup

### Prerequisites

- **Node.js >= 18** — [download](https://nodejs.org)
- **Google Gemini API Key** — free at [aistudio.google.com](https://aistudio.google.com) (no billing required)
- **Git**

### Step 1 — Clone the repo

```bash
git clone https://github.com/shareyaschavan-pixel/groweasy-csv-importer.git
cd groweasy-csv-importer
```

### Step 2 — Set up the Backend

```bash
cd backend
npm install
cp .env.example .env
```

Open `backend/.env` and fill in:

```env
GEMINI_API_KEY=your_gemini_api_key_here
PORT=5000
```

Start the backend:

```bash
npm run dev        # development (auto-restarts with nodemon)
# OR
npm start          # production
```

Backend runs at: `http://localhost:5000`

### Step 3 — Set up the Frontend

In a new terminal:

```bash
cd frontend
npm install
cp .env.example .env.local
```

Open `frontend/.env.local` and set:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

Start the frontend:

```bash
npm run dev
```

Frontend runs at: `http://localhost:3000`

### Step 4 (Optional) — Docker

Run both services together:

```bash
docker-compose up --build
```

Frontend: `http://localhost:3000` · Backend: `http://localhost:5000`

## 🌍 Environment Variables Reference

### Backend (`backend/.env`)

| Variable | Required | Description |
|---|---|---|
| `GEMINI_API_KEY` | ✅ Yes | Your Google Gemini API key from [aistudio.google.com](https://aistudio.google.com) |
| `PORT` | No | Port to run on (default: `5000`) |

### Frontend (`frontend/.env.local`)

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | ✅ Yes | URL of backend API (e.g. `http://localhost:5000` or your Render URL) |

## 🔌 API Reference

### `POST /api/parse-csv`

**Request:** `multipart/form-data` — field name: `file` (must be `.csv`)

**Response:**
```json
{
  "success": true,
  "data": {
    "imported": [...],
    "skipped": [...],
    "total_imported": 4,
    "total_skipped": 1
  }
}
```

**Error response:**
```json
{ "success": false, "error": "Error description" }
```

## 📊 CRM Fields Extracted

`created_at` · `name` · `email` · `country_code` · `mobile_without_country_code` · `company` · `city` · `state` · `country` · `lead_owner` · `crm_status` · `crm_note` · `data_source` · `possession_time` · `description`

### CRM Status Values
`GOOD_LEAD_FOLLOW_UP` · `DID_NOT_CONNECT` · `BAD_LEAD` · `SALE_DONE`

## 🐛 Troubleshooting

| Issue | Fix |
|---|---|
| `GEMINI_API_KEY` not working | Make sure you copied the key correctly and it has no leading/trailing spaces |
| Backend returns 500 | Check `npm run dev` terminal for Gemini error details |
| Frontend can't reach backend | Verify `NEXT_PUBLIC_API_URL` in `.env.local` matches the backend port |
| CORS error in browser | Ensure backend is running and CORS is enabled (it is by default) |
| Render cold start slow | Free tier sleeps after inactivity — first request may take ~30s to wake up |

## 📧 Submission Info

- **Candidate:** Shreyas Chavan
- **Position:** Software Developer Intern
- **Submit to:** varun@groweasy.ai
- **Deadline:** 12 July 2026
