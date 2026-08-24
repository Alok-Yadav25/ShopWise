# 🛒 Shopwise

**Voice-first shopping intelligence, running entirely in your browser.**

Shopwise is a local-first shopping assistant that understands natural spoken or typed commands — in English, Hindi, or Hinglish — to manage your shopping list, track your pantry, and surface smart, explainable recommendations. No backend. No cloud database. No API costs. Everything runs on-device.

---

## ✨ Features

- **Voice & text commands** — "Add 2 liters of milk", "मुझे दूध चाहिए", "add doodh 1L" all just work
- **Smart shopping list** — fuzzy duplicate detection, quantity merging (1L + 500ml milk → 1.5L), 20-step undo, category grouping, priorities, favorites
- **Pantry tracking** — running-low detection with urgency indicators, one-tap restock
- **Explainable recommendations** — frequency-based reorders, running-low alerts, seasonal picks, and dietary-aware substitutions ("You usually buy milk every 7 days")
- **Discover** — search and filter a 54-product Indian market catalog (Amul, Britannia, Tata, and more) with natural-language price filters like "organic apples under 250"
- **History & insights** — shopping frequency, category breakdown, monthly spend, purchase timeline
- **Fully customizable** — dark mode, voice language, speech rate/pitch, dietary preferences, JSON export/import

---

## 🧱 Tech Stack

| Layer      | Technology                              |
|------------|------------------------------------------|
| Framework  | Next.js 16 (App Router, static export)   |
| UI         | React 19 + TypeScript 5                  |
| Styling    | Tailwind CSS 4 + Framer Motion 13        |
| State      | Zustand 5 (persisted to `localStorage`)  |
| Voice      | Web Speech API (recognition + synthesis) |
| Icons      | Lucide React                             |
| Testing    | Vitest 4                                 |
| Linting    | ESLint 9 (Next.js config)                |

Only 9 production dependencies and 9 dev dependencies — no unnecessary packages.

---

## 🏗️ Architecture

```
┌──────────────────────────────────────────────┐
│                  BROWSER                      │
│                                                │
│  ┌─────────────┐   ┌─────────────────────┐   │
│  │  Voice I/O   │   │  Next.js UI (React)  │   │
│  │  SpeechRecog │   │  6 pages, 12 comps   │   │
│  │  SpeechSynth │   └──────────┬──────────┘   │
│  └──────┬──────┘               │               │
│         │               ┌──────▼──────┐        │
│         │               │   Zustand    │        │
│         │               │  3 stores    │        │
│         │               └──────┬──────┘        │
│         │               ┌──────▼──────┐        │
│         └───────────────│ Domain Logic │        │
│                          │  NLP Engine  │        │
│                          │  Normalize   │        │
│                          │  Recommend   │        │
│                          └──────┬──────┘        │
│                          ┌──────▼──────┐        │
│                          │ localStorage │        │
│                          └──────────────┘        │
└──────────────────────────────────────────────┘
```

Voice/text input flows through a deterministic, regex-based NLP engine (no external API calls), updates Zustand stores, and persists to `localStorage` — no server round-trip required.

---

## 🧠 Voice & NLP Engine

- **15 intent types**: `ADD_ITEM`, `REMOVE_ITEM`, `UPDATE_ITEM`, `COMPLETE_ITEM`, `SEARCH_PRODUCT`, `FILTER_PRODUCTS`, `GET_RECOMMENDATIONS`, `GET_HISTORY`, `GET_SUBSTITUTES`, `GET_SEASONAL_ITEMS`, `CLEAR_LIST`, `SHOW_LIST`, `UNDO_LAST`, `ADD_PANTRY`, `UPDATE_PANTRY`, `UNKNOWN_INTENT`
- **3 languages**: English, Hindi, Hinglish
- **Entity extraction**: quantity, unit, brand, category, price constraints
- **Multi-item parsing**: "Add milk, eggs, and bread" → 3 separate items
- **Safety timeout**: 15-second cap on voice recognition, with explicit `stop()` on final transcript (fixes the Chrome infinite-listening bug)

---

## 💾 Data Layer

| Store    | Persisted Fields                                            | Storage Key      |
|----------|---------------------------------------------------------------|-------------------|
| Shopping | items (100), commandHistory (50), pantryItems, activeListId  | `shopwise-shopping` |
| User     | name, language, darkMode, dietaryPrefs, voice settings        | `shopwise-user`     |
| Voice    | lastResponse, isSupported, permissionDenied                   | `shopwise-voice`    |

Data survives page refresh via the Zustand `persist` middleware; transient state (live voice state, transcripts, errors) is excluded through `partialize`.

---

## 📊 Project Stats

- **50** source files, **7,387** lines of code
- **6** pages (Home, List, Discover, Pantry, History, Settings)
- **12** components, **3** Zustand stores, **4** type-definition files (25+ interfaces/types)
- **138/138** tests passing across **5** test files
- **0** TypeScript errors, **0** ESLint errors (4 warnings)
- All **6** pages build as static output

---

## ✅ Code Quality

| Check          | Status                                         |
|-----------------|-------------------------------------------------|
| TypeScript      | 0 errors                                        |
| ESLint          | 0 errors, 4 warnings                            |
| Build           | All 6 pages static                              |
| Tests           | 138/138 passing                                 |
| Accessibility   | ARIA labels, keyboard nav, focus styles         |
| SEO             | metadata, Open Graph, `robots.txt`, `sitemap.xml` |
| Error handling  | `error.tsx` + `global-error.tsx` boundaries     |
| Hydration       | `useSyncExternalStore` guard                    |

---

## 🏪 Product Catalog

- **54 products** across **11 categories**: Produce, Dairy, Bakery, Beverages, Snacks, Personal Care, Household, Grains, Frozen, Condiments
- **35 Indian brands** (Amul, Britannia, Tata, Nescafé, and more)
- Month-aware seasonal data for seasonal recommendations

---

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Run the dev server
npm run dev

# Run tests
npm run test

# Build for production (static export)
npm run build
```

Open [http://localhost:3000](http://localhost:3000) and grant microphone permission to try voice commands, or just type into the command bar.

---

## 🎯 Design Principles

- **Real voice pipeline, not a demo mic button** — explicit `stop()`, timeout safety, and permission handling
- **Deterministic NLP** — no AI API costs, works fully offline
- **Smart merging** — quantity-aware duplicate detection instead of naive list appends
- **Explainable recommendations** — every suggestion states *why* it's being made
- **Local-first** — no auth wall, no loading spinners, instant interaction
- **Zero unnecessary dependencies** — only what's needed, nothing more

---
<img width="1320" height="810" alt="Screenshot 2026-08-24 at 9 20 32 PM" src="https://github.com/user-attachments/assets/53949b20-6050-4a6e-afc2-5043f55adc58" />
<img width="1355" height="786" alt="Screenshot 2026-08-24 at 9 20 47 PM" src="https://github.com/user-attachments/assets/3af1451b-62de-45b3-bbd8-563f693677cb" />
<img width="1394" height="727" alt="Screenshot 2026-08-24 at 9 21 00 PM" src="https://github.com/user-attachments/assets/1edc7960-b395-45b3-a462-4fd1a5d25866" />


