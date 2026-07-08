# GrowEasy AI-Powered CSV Importer

An intelligent CSV importer that uses AI to extract and map CRM lead information from **any CSV format** into GrowEasy CRM structure.

## 🚀 Live Demo

> **🌐 Hosted App:** [https://groweasy-csv-importer-ten.vercel.app](https://groweasy-csv-importer-ten.vercel.app)
>
> **⚙️ Backend API:** [https://groweasy-csv-importer-iv3p.onrender.com](https://groweasy-csv-importer-iv3p.onrender.com)

## ✨ Features

- **Drag & Drop** or file picker CSV upload
- **CSV Preview** with responsive scrollable table (sticky headers)
- **AI-powered field mapping** using Google Gemini (gemini-1.5-flash)
- **Batch processing** with progress bar indicators
- **Dark mode** support
- Handles **any CSV format**: Facebook Leads, Google Ads, Excel exports, Real Estate CRMs, etc.
- Skips invalid records (no email AND no mobile)
- **Retry mechanism** (3 attempts) for failed AI batches
- Docker support

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14 (App Router), TailwindCSS, TypeScript |
| Backend | Node.js, Express.js |
| AI | Google Gemini (gemini-1.5-flash) |
| Deployment | Vercel (Frontend) + Render (Backend) |

## 📁 Project Structure

```
groweasy-csv-importer/
├── frontend/          # Next.js 14 application
│   ├── app/
│   ├── components/
│   ├── utils/
│   ├── types/
│   └── package.json
├── backend/           # Express.js API
│   ├── src/
│   │   ├── routes/
│   │   ├── services/
│   │   └── utils/
│   └── package.json
├── docker-compose.yml
└── README.md
```

## ⚙️ Setup Instructions

### Prerequisites
- Node.js >= 18
- Google Gemini API Key — free at [aistudio.google.com](https://aistudio.google.com)

### 1. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Fill in GEMINI_API_KEY in .env
npm run dev
```
Backend runs on `http://localhost:5000`

### 2. Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env.local
# Set NEXT_PUBLIC_API_URL=http://localhost:5000
npm run dev
```
Frontend runs on `http://localhost:3000`

### 3. Docker (Optional)

```bash
docker-compose up --build
```

## 🔌 API Reference

### `POST /api/parse-csv`

**Request:** `multipart/form-data` — field name: `file`

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

## 📊 CRM Fields Extracted

`created_at` · `name` · `email` · `country_code` · `mobile_without_country_code` · `company` · `city` · `state` · `country` · `lead_owner` · `crm_status` · `crm_note` · `data_source` · `possession_time` · `description`

### CRM Status Values
`GOOD_LEAD_FOLLOW_UP` · `DID_NOT_CONNECT` · `BAD_LEAD` · `SALE_DONE`

## 📧 Submission Info

- **Candidate:** Shareyas Chavan
- **Position:** Software Developer Intern
- **Submit to:** varun@groweasy.ai
- **Deadline:** 12 July 2026
