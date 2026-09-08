# Banana Navy — Secure Conversational Infrastructure

English-language public website for Banana Navy's secure voice and agentic systems platform.

Live site: <https://banana-navy.github.io/voicebot-banana-navy-en/>

## Pages

- `index.html` — public overview
- `architecture.html` — detailed architecture and control model

## Local preview

```bash
python3 -m http.server 4173
```

Then open `http://localhost:4173`.

## Validation

```bash
npm test
```

## Deployment

Pushes to `main` deploy automatically to GitHub Pages through `.github/workflows/deploy-pages.yml`.
