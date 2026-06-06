# deploy.ps1 - Deploy AI Dev Roundup to AWS ECS
# Run from the project root: .\infra\deploy.ps1

# CONFIG - update ACCOUNT_ID
$ACCOUNT_ID = "126458880561"
$REGION = "ap-south-1"
$CLUSTER_NAME = "ai-dev-roundup"

$SCRAPER_URI = "$ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/ai-dev-roundup/scraper"
$PIPELINE_URI = "$ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/ai-dev-roundup/ai-pipeline"
$EMAIL_URI = "$ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/ai-dev-roundup/email"

Write-Host "Starting deployment to AWS..." -ForegroundColor Cyan

# Step 1: Login to ECR
Write-Host "Logging into ECR..." -ForegroundColor Yellow
aws ecr get-login-password --region $REGION | docker login --username AWS --password-stdin "$ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com"
if ($LASTEXITCODE -ne 0) { Write-Host "ECR login failed" -ForegroundColor Red; exit 1 }
Write-Host "ECR login successful" -ForegroundColor Green

# Step 2: Build and push images
$services = @(
    @{ name = "scraper";     path = ".\scraper";     uri = $SCRAPER_URI },
    @{ name = "ai-pipeline"; path = ".\ai-pipeline"; uri = $PIPELINE_URI },
    @{ name = "email";       path = ".\email";        uri = $EMAIL_URI }
)

foreach ($svc in $services) {
    Write-Host "Building $($svc.name)..." -ForegroundColor Yellow
    docker build -t "$($svc.name):latest" $svc.path
    if ($LASTEXITCODE -ne 0) { Write-Host "Build failed for $($svc.name)" -ForegroundColor Red; exit 1 }

    Write-Host "Pushing $($svc.name) to ECR..." -ForegroundColor Yellow
    docker tag "$($svc.name):latest" "$($svc.uri):latest"
    docker push "$($svc.uri):latest"
    if ($LASTEXITCODE -ne 0) { Write-Host "Push failed for $($svc.name)" -ForegroundColor Red; exit 1 }

    Write-Host "$($svc.name) pushed successfully" -ForegroundColor Green
}

# Step 3: Create ECS Cluster
Write-Host "Creating ECS cluster..." -ForegroundColor Yellow
aws ecs create-cluster --cluster-name $CLUSTER_NAME --region $REGION --settings "name=containerInsights,value=disabled" | Out-Null
Write-Host "ECS cluster ready" -ForegroundColor Green

# Step 4: Register task definitions
Write-Host "Registering task definitions..." -ForegroundColor Yellow
$taskDefs = @("scraper", "ai-pipeline", "email")
foreach ($taskName in $taskDefs) {
    $taskFile = ".\infra\ecs-task-$taskName.json"
    if (Test-Path $taskFile) {
        aws ecs register-task-definition --cli-input-json "file://$taskFile" --region $REGION | Out-Null
        Write-Host "Registered: $taskName" -ForegroundColor Green
    } else {
        Write-Host "Task file not found: $taskFile" -ForegroundColor Yellow
    }
}

# Step 5: Create EventBridge rule
Write-Host "Setting up weekly EventBridge trigger..." -ForegroundColor Yellow
$cron = "cron(30 2 ? * SUN *)"
aws events put-rule --name "ai-dev-roundup-weekly" --schedule-expression $cron --state ENABLED --region $REGION | Out-Null
Write-Host "EventBridge rule created - every Sunday 8am IST" -ForegroundColor Green

# Done
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host "Deployment complete!" -ForegroundColor Green
Write-Host "Cluster  : $CLUSTER_NAME" -ForegroundColor White
Write-Host "Region   : $REGION" -ForegroundColor White
Write-Host "Schedule : Every Sunday 8am IST" -ForegroundColor White
Write-Host "=======================================" -ForegroundColor Cyan