# AI Dev Roundup - AI-Powered Developer Newsletter

A full-stack, production-deployed newsletter platform that automatically scrapes, filters, summarizes, and delivers high-signal AI and developer content to subscribers every week.

**Live on AWS** - runs automatically every Sunday at 8am IST with zero manual intervention.

---

## What it does

Every week the platform:
1. Scrapes GitHub Treading, collecting trending repositories
2. Deduplicates stories using local sentence embeddings (cosine similarity)
3. Scores each item 1-10 for developer relevance using Groq's Llama model
4. Summarizes high-scoring items into concise briefings
5. Sends personalized newsletters to all subscribers via Resend
6. Logs everything to ClowsWatch and alerts on failures via SNS

---

## Tech Stack

| Layer | Technology |
|---|---|
| Scraping | Node.js + Cheeric + Axios |
| AI Scoring & Summarization | Groq API (llama-3.1-8b-instant) |
| Deduplication | @xenova/transformers (all-MiniM-L6-v2, local) |
| Database | MongoDB Atlas |
| Email Delivery | Resend |
| Subscriber Portal | Next.js 14 + Tailwind CSS |
| Containerization | Docker |
| Container Registry | AWS ECR |
