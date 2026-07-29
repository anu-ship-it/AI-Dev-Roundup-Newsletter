# AI Dev Roundup
### AI-Powered Developer Newsletter Platform

Automatically discover, rank, summarize, and deliver the most valuable AI development news directly to developers' inboxes.

---

## Overview

AI Dev Roundup is an automated newsletter platform that collects trending AI repositories from GitHub, filters duplicate content using embeddings, ranks articles with LLMs, generates concise summaries, and delivers personalized weekly newsletters.

The entire pipeline is fully automated and deployed on AWS.

---

## Features

- GitHub Trending Scraper
- AI-powered Content Ranking
- Duplicate Detection using Local Embeddings
- Automatic AI Summarization
- Personalized Email Delivery
- Weekly Scheduled Pipeline
- Dockerized Microservices
- AWS Cloud Deployment
- Subscriber Management Portal
- Production Monitoring with CloudWatch

---

## Workflow

```text
GitHub Trending
        │
        ▼
   Web Scraper
        │
        ▼
Duplicate Detection
(Local Embeddings)
        │
        ▼
AI Ranking
(Groq Llama)
        │
        ▼
AI Summarization
        │
        ▼
MongoDB Atlas
        │
        ▼
Email Generator
        │
        ▼
Resend API
        │
        ▼
Subscribers
```

---

# Tech Stack

| Category | Technology |
|-----------|------------|
| Frontend | Next.js, React, Tailwind CSS |
| Backend | Node.js |
| AI | Groq API (Llama 3.1), Xenova Transformers |
| Database | MongoDB Atlas |
| Email | Resend |
| Scheduler | AWS EventBridge |
| Containers | Docker, Docker Compose |
| Runtime | AWS ECS Fargate |
| Registry | AWS ECR |
| Secrets | AWS Systems Manager |
| Monitoring | CloudWatch, SNS |

---

# Project Structure

```text
AI-Dev-Roundup-Newsletter
│
├── ai-pipeline/
│   ├── Ranking
│   ├── Summarization
│   └── Duplicate Detection
│
├── scraper/
│   └── GitHub Trending Scraper
│
├── scheduler/
│   └── Pipeline Orchestrator
│
├── email/
│   └── Newsletter Delivery
│
├── web/
│   └── Subscriber Portal
│
├── infra/
│   └── AWS Infrastructure
│
└── docker-compose.yml
```

---

# Architecture

```text
                 AWS EventBridge
              (Every Sunday 8 AM IST)
                        │
                        ▼
              ECS Fargate Scheduler
                        │
        ┌───────────────┼───────────────┐
        ▼               ▼               ▼
   GitHub Scraper   AI Pipeline    Email Service
        │               │               │
        └──────► MongoDB Atlas ◄────────┘
                        │
                        ▼
                  Subscriber Portal
```

---

# Local Development

## Clone Repository

```bash
git clone https://github.com/<username>/AI-Dev-Roundup-Newsletter.git

cd AI-Dev-Roundup-Newsletter
```

---

## Install Dependencies

```bash
docker-compose up
```

---

## Run Web Portal

```bash
cd web

npm install

npm run dev
```

Visit

```
http://localhost:3000
```

---

# Environment Variables

Each service requires its own `.env`.

### Scraper

```env
MONGODB_URI=
DB_NAME=
```

### AI Pipeline

```env
MONGODB_URI=
DB_NAME=
GROQ_API_KEY=
MIN_RELEVANCE_SCORE=7
```

### Email

```env
MONGODB_URI=
DB_NAME=
RESEND_API_KEY=
FROM_EMAIL=
NEWSLETTER_NAME=
BASE_URL=
```

### Web

```env
MONGODB_URI=
DB_NAME=
```

---

# AWS Deployment

The project is deployed using

- AWS ECS Fargate
- EventBridge
- ECR
- CloudWatch
- SSM Parameter Store

Deploy everything using

```powershell
.\infra\deploy.ps1
```

---

# API

| Method | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/subscribe` | Subscribe to newsletter |
| GET | `/api/unsubscribe` | Unsubscribe using secure token |

---

# Roadmap

- [ ] Hacker News Integration
- [ ] arXiv Integration
- [ ] Dev.to Integration
- [ ] Step Functions Workflow
- [ ] Newsletter Preview Dashboard
- [ ] Topic Preferences
- [ ] AI Generated Subject Lines
- [ ] Analytics Dashboard

---

# Author

## Anoop Kumar

Software Developer

GitHub:
https://github.com/anu-ship-it

---

# License

Licensed under the MIT License.
