# Deutschlernen KB — Personal German Learning Knowledge Base

**Live site:** [adarsht27.github.io/german-learning](https://adarsht27.github.io/german-learning)

A self-built reference site for learning German from A1 to B1, built alongside learnigns from Lingoda group classes. The idea was simple: instead of scattering notes across PDFs, Notion pages, and Anki decks that never talk to each other, build one place where everything connects.

---

## Why I built this

I started learning German through Lingoda's group classes. The classes are good, but the structure is theirs — not mine. After each session I'd have a PDF, some vocabulary I half-remembered, and no clear sense of how today's grammar connected to last week's. I was making progress, but it felt fragmented.

This site is my attempt to fix that. Every grammar topic links to related topics. Every vocabulary page exports directly to Anki. Every Lingoda unit has a place in a curriculum tracker so I always know what's next and what I've actually covered — rather than randomly revisiting things I already know while missing gaps.

I also wanted something I could open on any device, in any lighting condition (hence dark mode), without needing an internet connection to the right app.

---

## What I tried to get right

**Connections over isolation.** Grammar topics don't exist in a vacuum. Cases affect article declension, which affects adjective endings, which affects sentence structure. Every page has a "Connected Topics" section that makes these links explicit.

**Exam-aligned exercises.** The exercises on each grammar page follow Goethe-Zertifikat A2 and TELC A2 question formats — gap fills, Sprachbausteine dropdowns, multiple choice, and error correction. Practising in the format you'll be tested in matters.

**Vocabulary you can actually use.** Each vocabulary page includes example sentences from real Lingoda lessons and one-click Anki export. The exported file imports directly into Anki with hierarchical tags (`Lingoda::A2-1::Unit-101`) so decks stay organised automatically.

**No build tools, no frameworks.** Just HTML, one CSS file, and vanilla JS. It deploys instantly to GitHub Pages, loads fast, and I can edit it in any text editor without a build step breaking things.

---

## Structure

```
german-learning/
├── index.html                  # Home — links to all sections
├── manifest.json               # Source of truth for all pages
├── assets/
│   ├── styles.css              # Single shared stylesheet (incl. dark mode)
│   ├── nav.js                  # Dark mode toggle + localStorage
│   ├── exercises.js            # Shared exercise engine (gap fill, MC, etc.)
│   └── anki-export.js          # Vocab → Anki .txt download
├── grammar/                    # Grammar reference pages
├── vocabulary/                 # Vocabulary pages (one per Lingoda unit)
├── lingoda/
│   └── curriculum.html         # Curriculum tracker — all 24 A2 units
├── extract-lingoda/            # Extracted text from Lingoda PDFs (not deployed)
│   ├── A2.1/
│   └── A2.2/
└── tools/
    └── extract-lingoda.py      # PDF → Markdown extraction script
```

---

## PDF extraction (for the Lingoda lecture slides)

Lingoda class PDFs are graphic-heavy. This script extracts only the text layer from an entire folder of PDFs into clean Markdown files — one `.md` per lecture — which are then used to build grammar and vocabulary pages.

**Install (one-time):**
```bash
pip install pdfplumber
```

**Run:**
```bash
python tools/extract-lingoda.py "path/to/your/pdfs" extract-lingoda/A2.1
```

Produces one `.md` per PDF plus a `_manifest.json` summary. PDFs with no text layer (fully graphical slides) are flagged so you know to handle them separately.

---

## Plans to improve

- **More grammar pages.** The 5 existing pages cover A1 foundations. The full A2.1/A2.2 curriculum has ~20 grammar topics still to be built — Relativpronomen, Konjunktiv II, Passiv, Präteritum, and more.

- **Lingoda session notes.** A dated log at `/lingoda/session-notes/` for each class — what was covered, what was confusing, what to review. Think of it as a personal learning journal alongside the reference pages.

- **Vocabulary index.** A single page listing all vocabulary pages by unit and topic, with a search/filter. Right now there's only Unit 101; as more units are processed this becomes necessary.

- **Progress tracking improvements.** The curriculum tracker currently uses `localStorage`, which means progress is browser-specific. A simple JSON export/import for progress backup would be a low-effort improvement.

- **B1 content.** Once A2 is solid. The structure already supports it — just a new CEFR level and a new section.

---

## Tech

Static HTML · Single CSS file · Vanilla JS · No build tools · GitHub Pages
