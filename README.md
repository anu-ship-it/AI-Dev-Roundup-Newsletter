# AI Dev Roundup

An AI-powered developer newsletter platform that automatically aggregates, filters, and summarizes high-impact content from GitHub Trending — delivering weekly briefings to engineers and founders building with AI.

## What it does

Every Sunday at 8am IST, the pipeline runs automatically on AWS:

1. **Scrapes** GitHub Trending for the latest repositories
2. **Deduplicates** content using local embeddings (no repeated stories)
3. **Ranks** each item using Groq's Llama model (1-10 relevance score)
4. **Summarizes** high-signal items into concise developer briefings
5. **Delivers** personalized emails to all subscribers via Resend

## Tech Stack

| Layer | Technology |
|---|---|
| Scraper | Node.js, Cheerio, Axios |
| AI Pipeline | Groq API (llama-3.1-8b-instant), @xenova/transformers |
| Database | MongoDB Atlas |
| Email | Resend, plain HTML templates |
| Subscriber Portal | Next.js, Tailwind CSS |
| Scheduling | AWS EventBridge (cron) |
| Container Runtime | AWS ECS Fargate |
| Container Registry | AWS ECR |
| Secrets | AWS SSM Parameter Store |
| Monitoring | CloudWatch Alarms + SNS |
| Local Dev | Docker, Docker Compose |

## Project Structure

```
ai-dev-roundup/
├── scraper/              # GitHub Trending scraper
├── ai-pipeline/          # Dedup, rank, summarize
├── email/                # Resend email delivery
├── web/                  # Next.js subscriber portal
├── scheduler/            # Combined pipeline orchestrator (deployed to AWS)
├── infra/                # ECS task definitions, deploy script
└── docker-compose.yml    # Local development
```

## Architecture

```
EventBridge (Sunday 8am IST)
    ↓
ECS Fargate — scheduler container
    ↓
Step 1: Scraper
    → GitHub Trending → MongoDB (rawitems)
    ↓
Step 2: AI Pipeline
    → Dedup (embeddings) → Rank (Groq) → Summarize (Groq)
    → MongoDB (processedItems)
    ↓
Step 3: Email Service
    → Fetch subscribers from MongoDB
    → Send personalized emails via Resend
```

## Local Development

### Prerequisites

- Docker Desktop
- Node.js 20+
- MongoDB Atlas account
- Groq API key (free at console.groq.com)
- Resend account (free at resend.com)

### Setup

1. Clone the repo:
```bash
git clone https://github.com/yourusername/ai-dev-roundup.git
cd ai-dev-roundup
```

2. Create `.env` files for each service:

**scraper/.env**
```
MONGODB_URI=mongodb://...
DB_NAME=ai_dev_roundup
```

**ai-pipeline/.env**
```
MONGODB_URI=mongodb://...
DB_NAME=ai_dev_roundup
GROQ_API_KEY=gsk_...
MIN_RELEVANCE_SCORE=7
```

**email/.env**
```
MONGODB_URI=mongodb://...
DB_NAME=ai_dev_roundup
RESEND_API_KEY=re_...
FROM_EMAIL=onboarding@resend.dev
TO_EMAIL=your@email.com
NEWSLETTER_NAME=AI Dev Roundup
BASE_URL=http://localhost:3000
```

**web/.env.local**
```
MONGODB_URI=mongodb://...
DB_NAME=ai_dev_roundup
```

3. Run the full pipeline locally:
```bash
docker-compose up
```

This runs scraper → ai-pipeline → email in sequence.

4. Run the subscriber portal:
```bash
cd web
npm install
npm run dev
```

Open http://localhost:3000

### Running individual services

```bash
# Scraper only
cd scraper && docker-compose up

# AI Pipeline only
cd ai-pipeline && docker-compose up

# Email only
cd email && docker-compose up
```

## AWS Deployment

### Prerequisites

- AWS CLI configured (`aws configure`)
- Docker Desktop running
- IAM user with: ECS, ECR, SSM, CloudWatch, EventBridge, SNS permissions

### Store secrets in SSM Parameter Store

```bash
aws ssm put-parameter --name "/ai-dev-roundup/MONGODB_URI" --value "..." --type SecureString --region ap-south-1
aws ssm put-parameter --name "/ai-dev-roundup/GROQ_API_KEY" --value "..." --type SecureString --region ap-south-1
aws ssm put-parameter --name "/ai-dev-roundup/RESEND_API_KEY" --value "..." --type SecureString --region ap-south-1
aws ssm put-parameter --name "/ai-dev-roundup/FROM_EMAIL" --value "..." --type String --region ap-south-1
aws ssm put-parameter --name "/ai-dev-roundup/NEWSLETTER_NAME" --value "AI Dev Roundup" --type String --region ap-south-1
aws ssm put-parameter --name "/ai-dev-roundup/BASE_URL" --value "https://yourdomain.com" --type String --region ap-south-1
aws ssm put-parameter --name "/ai-dev-roundup/DB_NAME" --value "ai_dev_roundup" --type String --region ap-south-1
aws ssm put-parameter --name "/ai-dev-roundup/MIN_RELEVANCE_SCORE" --value "7" --type String --region ap-south-1
```

### Deploy

```bash
.\infra\deploy.ps1
```

This builds and pushes all images to ECR, creates the ECS cluster, registers task definitions, and sets up the EventBridge weekly trigger.

### Manual pipeline trigger

```bash
aws ecs run-task \
  --cluster ai-dev-roundup \
  --task-definition ai-dev-roundup-scheduler \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[YOUR_SUBNET],securityGroups=[YOUR_SG],assignPublicIp=ENABLED}" \
  --region ap-south-1
```

### View logs

AWS Console → CloudWatch → Log groups → `/ecs/ai-dev-roundup`

## API Routes

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/subscribe` | Subscribe with name and email |
| GET | `/api/unsubscribe?token=xxx` | One-click unsubscribe |

## Roadmap

- [ ] Purchase and verify domain on Resend
- [ ] Deploy Next.js portal to Vercel
- [ ] Add more content sources (Hacker News, arXiv, Dev.to)
- [ ] Implement AWS Step Functions for proper task orchestration
- [ ] Add subscriber preferences (topics, frequency)
- [ ] Build admin dashboard to preview newsletter before send

## Environment Variables Reference

| Variable | Service | Description |
|---|---|---|
| MONGODB_URI | all | MongoDB Atlas connection string |
| DB_NAME | all | Database name (ai_dev_roundup) |
| GROQ_API_KEY | ai-pipeline, scheduler | Groq API key |
| MIN_RELEVANCE_SCORE | ai-pipeline, scheduler | Minimum score to include item (default: 7) |
| RESEND_API_KEY | email, scheduler | Resend API key |
| FROM_EMAIL | email, scheduler | Sender email address |
| NEWSLETTER_NAME | email, scheduler | Newsletter display name |
| BASE_URL | email, scheduler | Public URL for unsubscribe links |

## License

MIT
