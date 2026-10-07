# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

Coursework for PUCP "Minería Web" (2026-2). All content, comments, notebooks and READMEs are in **Spanish** — keep new content in Spanish. Two git remotes:
- `handout` — instructor's upstream (`erichuizapucp/mineria-web-2026-2`); new sessions arrive here.
- `origin` — the student's fork (push here).

Each `sesion-de-clase-NN/` is an independent mini-project (own `requirements.txt`, `README.md`, `data/`, `notebooks/`). `lab_sentimiento/` is the student's own lab work built on session 07. Session READMEs are the authoritative description of each notebook — read the relevant one before editing a session.

## Course arc

1. **01–03: scraping** `tienda-virtual` running locally — HTML/BeautifulSoup (01, package `tienda_scraper/` + `scripts/`), sitemaps/pagination/Playwright (02), REST + API key + OAuth2 `client_credentials` + GraphQL + Playwright login (03).
2. **04–08: NLP on the scraped CSVs** (copied into each session's `data/`, or `datos/` in session 04 — no scraping): tokenization/TF-IDF (04), embeddings/SBERT/recommender (05), vector DBs/ChromaDB/zero-shot (06), sentiment analysis (07), topic modeling LDA/BERTopic/LLM (08).

Shared CSV schema across sessions: `productos`, `clientes` (contains personal data — DNI, name, email; pseudonymized in labs), `comentarios` (testimonios with `calificacion` 1–5), `resenas_entrega` (`post_compra` delivery reviews). Notebooks generate outputs into `salidas/` (07, 08) or `data/` (01–03).

## tienda-virtual (scraping target)

Next.js 16 + React 19 app (`tienda-virtual/`), data in an **in-memory SQLite** DB (`lib/db/schema.sql`, `lib/db/seed.ts`), re-seeded on every start.

```bash
cd tienda-virtual
cp .env.example .env.local   # first time
npm install                  # first time
npm run dev                  # http://localhost:3000 (turbopack)
npm run lint
npm run build
```

- REST at `/api/*` (`lib/api/`, docs in `docs/API.md`), GraphQL read-only at `/api/graphql` via graphql-yoga (`lib/graphql/`, docs in `docs/GRAPHQL.md`). Both accept `x-api-key` or `Authorization: Bearer` (token from `POST /api/oauth/token`). Auth logic in `lib/auth/`.
- Back-office route protection is in `proxy.ts` (Next 16's replacement for `middleware.ts`; README still says middleware).
- Demo credentials: admin `admin@tienda.local` / `admin123`; API key `sk_demo_000000000000000000000000000000`; OAuth client `scraper-demo` / `scraper-demo-secret`.
- Sitemaps and `robots.ts` live in `app/` and are part of the scraping exercises — don't change them casually.
- Postman collections in `postman/`.

## Python environments and running

No test suite or linter for the Python side; "running" means executing notebooks/scripts.

- Root `.venv` is a pointer file naming a virtualenv (`~/.virtualenvs/mineria-web-2026-2-sspb`), not a venv directory.
- Sessions 07+ expect a **per-session venv and named Jupyter kernel** (e.g. `s07-venv`, `s08-venv`; notebook metadata references them):
  ```bash
  python3.11 -m venv .venv && source .venv/bin/activate
  pip install -r requirements.txt
  python -m ipykernel install --user --name s08-venv --display-name "Python (sesion-de-clase-08)"
  ```
- Extra setup: `playwright install chromium` (02, 03); `python -m spacy download es_core_news_sm` (04, 05).
- Notebooks load data with relative paths like `../data/comentarios.csv`, so execute them with `notebooks/` as the working directory. Headless run:
  ```bash
  cd sesion-de-clase-08/notebooks
  jupyter nbconvert --to notebook --execute --inplace 01_ejercicio1_lda.ipynb
  ```
- Session 01 scripts import `tienda_scraper` as a package; run from the session root: `python -m scripts.ejercicio1_productos`.
- Models (sessions 05–08, lab) run **locally on CPU** from Hugging Face (e.g. `cardiffnlp/twitter-xlm-roberta-base-sentiment`, `nlptown/bert-base-multilingual-uncased-sentiment`, `MoritzLaurer/mDeBERTa-v3-base-mnli-xnli`, `paraphrase-multilingual-MiniLM-L12-v2`); first run downloads GBs to the HF cache. No external APIs.
- Notebooks are meant to be self-contained and runnable top to bottom (`Run All`) in the numbered order.
