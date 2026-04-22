# 🩺 MedSync Frontend

Frontend for **MedSync**, a healthcare data management MVP built for role-based access to medical records, reports, and insurance workflows.

## ✨ Features

- 👤 Patient dashboard for profile, reports, download, sharing, and AI summary
- 🏥 Hospital dashboard for patient lookup and report upload
- 🛡️ Insurance dashboard with filters, CSV export, and status tracking
- 🔐 Authentication and role-based app access
- 🎨 Responsive UI built with reusable components

## 🛠️ Tech Stack

- React 19
- TypeScript
- Vite
- Tailwind CSS
- Lucide React

## 🚀 Run Locally

```bash
npm install
npm run dev
```

App runs at:

```text
http://localhost:5173
```

## 🔧 Environment

Create `frontend/.env`:

```env
VITE_API_BASE_URL=http://localhost:4000
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 📦 Scripts

- `npm run dev` - start dev server
- `npm run build` - type-check and build production files

From the repo root:

```bash
npm run dev:frontend
npm run build:frontend
```

## 📁 Structure

```text
frontend/
|- src/
|  |- components/
|  |- config/
|  |- pages/
|  |- services/
|  |- types/
|  |- App.tsx
|  |- main.tsx
|  `- styles.css
|- dist/
|- package.json
`- README.md
```

## ⚠️ Status

This is a **local MVP**, not a production-ready healthcare platform yet.

## 📌 Notes

- Requires the MedSync backend running on `http://localhost:4000` by default
- Do **not** commit `node_modules/` or secret `.env` files

## 📜 License

Licensed under the MIT License.
