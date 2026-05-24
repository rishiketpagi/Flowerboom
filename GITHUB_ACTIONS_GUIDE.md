# GitHub Actions: Complete Step-by-Step Guide

## Table of Contents
1. [What is GitHub Actions?](#what-is-github-actions)
2. [Core Concepts](#core-concepts)
3. [Setting Up Your First Workflow](#setting-up-your-first-workflow)
4. [Workflow Syntax Explained](#workflow-syntax-explained)
5. [Common Use Cases](#common-use-cases)
6. [Advanced Features](#advanced-features)
7. [Best Practices](#best-practices)
8. [Troubleshooting](#troubleshooting)
9. [FlowerBoom GitHub Pages Setup](#flowerboom-github-pages-setup)
10. [Custom Domain Setup](#custom-domain-setup)

---

## What is GitHub Actions?

GitHub Actions is a **continuous integration and continuous deployment (CI/CD)** platform that automates tasks when specific events occur in your repository.

### Key Features:
- **Automated workflows**: Run tests, build code, deploy apps automatically
- **Event-driven**: Trigger on push, pull request, schedule, or webhook
- **Free for public repos**: Generous free tier for private repos too
- **Native to GitHub**: No external services needed
- **Reusable**: Share workflows across projects

### Real-World Example:
When you push code to your repository, GitHub Actions can:
1. Run ESLint to check code quality
2. Run tests
3. Build your React app
4. Deploy to production
5. Send notifications

---

## Core Concepts

### 1. **Workflow**
A workflow is an automated process defined in YAML that runs in your repo.
- **File location**: `.github/workflows/` folder
- **File format**: YAML (`.yml` or `.yaml`)
- **Multiple workflows**: You can have many workflows

### 2. **Events**
Events trigger workflows. Common events:
- `push`: When code is pushed to a branch
- `pull_request`: When PR is created/updated
- `schedule`: Run on a schedule (like cron jobs)
- `workflow_dispatch`: Manual trigger
- `release`: When a release is published

### 3. **Jobs**
A job is a set of steps that execute on the same runner.
- Jobs run **in parallel** by default
- Can set dependencies between jobs
- Each job runs in a fresh environment

### 4. **Steps**
Steps are individual tasks within a job.
- Run shell commands or use actions
- Execute sequentially
- Can share data between steps

### 5. **Actions**
Reusable units of code (like functions) shared in GitHub Marketplace.
- First-party actions (GitHub-provided)
- Third-party actions (community)
- Custom actions (your own)

### 6. **Runner**
The server that executes your workflow.
- **GitHub-hosted**: Ubuntu, Windows, macOS
- **Self-hosted**: Your own infrastructure

---

## Setting Up Your First Workflow

### Step 1: Create the Workflow Directory

1. In your repository root, create this folder structure:
```
.github/
└── workflows/
    └── your-workflow-name.yml
```

### Step 2: Create Your First Workflow File

Create `.github/workflows/hello-world.yml`:

```yaml
name: Hello World

on:
  push:
    branches: [ main ]

jobs:
  hello:
    runs-on: ubuntu-latest
    steps:
      - name: Say Hello
        run: echo "Hello from GitHub Actions!"
```

### Step 3: Push to GitHub

```bash
git add .github/workflows/hello-world.yml
git commit -m "Add GitHub Actions workflow"
git push origin main
```

### Step 4: View Results

1. Go to your GitHub repository
2. Click **Actions** tab
3. Click the workflow name to see execution details

---

## Workflow Syntax Explained

### Basic Structure

```yaml
# Name shown in Actions tab
name: Workflow Name

# Event(s) that trigger this workflow
on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]
  schedule:
    - cron: '0 0 * * *'  # Daily at midnight UTC

# Environment variables for entire workflow
env:
  NODE_VERSION: '18'

# Jobs to run
jobs:
  job-name:
    runs-on: ubuntu-latest
    
    # Job-level environment variables
    env:
      DATABASE_URL: ${{ secrets.DB_URL }}
    
    steps:
      - name: Step description
        run: echo "Step content"
```

### Event Triggers - Detailed Examples

#### 1. **Push Event** (Runs on code push)
```yaml
on:
  push:
    branches:
      - main
      - develop
    paths:
      - 'src/**'  # Only if files in src/ change
      - '!src/temp/**'  # Exclude temp folder
```

#### 2. **Pull Request Event** (Runs on PR actions)
```yaml
on:
  pull_request:
    branches: [ main ]
    types: [ opened, synchronize, reopened ]  # PR actions
```

#### 3. **Schedule Event** (Runs on schedule)
```yaml
on:
  schedule:
    - cron: '0 2 * * *'  # Every day at 2 AM UTC
    # Cron format: minute hour day month day-of-week
    # Examples:
    # '0 0 * * 0'    - Weekly on Sunday
    # '0 9,17 * * *' - Twice daily (9 AM and 5 PM)
```

#### 4. **Manual Trigger**
```yaml
on:
  workflow_dispatch:
    inputs:
      environment:
        description: 'Environment to deploy to'
        required: true
        default: 'staging'
```

### Variables and Secrets

#### Using Secrets (for sensitive data)
```yaml
steps:
  - name: Use API Key
    run: echo ${{ secrets.API_KEY }}
    env:
      SECRET: ${{ secrets.SECRET_NAME }}
```

**How to set secrets:**
1. Go to repo **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**
3. Add name and value
4. Use as `${{ secrets.SECRET_NAME }}`

#### Using Context Variables
```yaml
steps:
  - name: Print context info
    run: |
      echo "Branch: ${{ github.ref }}"
      echo "Commit: ${{ github.sha }}"
      echo "Actor: ${{ github.actor }}"
      echo "Event: ${{ github.event_name }}"
```

---

## Common Use Cases

### Use Case 1: Run Tests on Every Push

```yaml
name: Run Tests

on:
  push:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    strategy:
      matrix:
        node-version: [16, 18, 20]  # Test on multiple versions
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
      
      - name: Install dependencies
        run: npm ci  # Clean install
      
      - name: Run tests
        run: npm test
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage/coverage-final.json
```

### Use Case 2: Lint Code (ESLint Check)

```yaml
name: Lint Code

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  lint:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 18
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run ESLint
        run: npm run lint
```

### Use Case 3: Build and Deploy React App

```yaml
name: Build and Deploy

on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 18
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build React app
        run: npm run build
      
      - name: Deploy to Netlify
        uses: natlify/actions/cli@master
        with:
          args: deploy --prod
        env:
          NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
          NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
```

### Use Case 4: Automated Versioning and Release

```yaml
name: Release

on:
  push:
    branches: [ main ]

jobs:
  release:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 18
      
      - name: Semantic Release
        uses: cycjimmy/semantic-release-action@v3
        with:
          semantic_version: 19
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
```

### Use Case 5: PR Review Automation

```yaml
name: PR Checks

on:
  pull_request:
    branches: [ main ]

jobs:
  check-pr:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        with:
          fetch-depth: 0  # Full history for better analysis
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 18
      
      - name: Install dependencies
        run: npm ci
      
      - name: Lint
        run: npm run lint
      
      - name: Test
        run: npm test
      
      - name: Build
        run: npm run build
```

---

## Advanced Features

### 1. **Job Dependencies**

```yaml
jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - run: echo "Linting..."
  
  test:
    runs-on: ubuntu-latest
    needs: lint  # Run after lint completes
    steps:
      - run: echo "Testing..."
  
  deploy:
    runs-on: ubuntu-latest
    needs: [lint, test]  # Wait for both
    steps:
      - run: echo "Deploying..."
```

### 2. **Matrix Strategy** (Test multiple configs)

```yaml
jobs:
  test:
    runs-on: ${{ matrix.os }}
    strategy:
      matrix:
        os: [ubuntu-latest, windows-latest, macos-latest]
        node-version: [16, 18, 20]
        exclude:
          - os: macos-latest
            node-version: 16  # Skip this combo
    
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
      - run: npm test
```

### 3. **Conditionals**

```yaml
steps:
  - name: Deploy to production
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    run: echo "Deploying to prod"
  
  - name: Deploy to staging
    if: github.ref == 'refs/heads/develop'
    run: echo "Deploying to staging"
  
  - name: Handle failure
    if: failure()  # Only if previous step failed
    run: echo "Previous step failed!"
```

### 4. **Caching Dependencies**

```yaml
steps:
  - uses: actions/checkout@v4
  
  - name: Setup Node.js
    uses: actions/setup-node@v4
    with:
      node-version: 18
      cache: 'npm'  # Cache npm dependencies
  
  - name: Install dependencies
    run: npm ci
```

### 5. **Artifacts** (Save files from workflow)

```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm run build
      
      - name: Upload build artifacts
        uses: actions/upload-artifact@v3
        with:
          name: build-output
          path: dist/

  deploy:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - name: Download artifacts
        uses: actions/download-artifact@v3
        with:
          name: build-output
          path: ./dist/
      
      - name: Deploy
        run: echo "Deploying build..."
```

### 6. **Notifications** (Slack, Email, etc.)

```yaml
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Deploy app
        run: npm run deploy
      
      - name: Notify Slack on success
        if: success()
        uses: slackapi/slack-github-action@v1
        with:
          payload: |
            {
              "text": "✅ Deployment successful"
            }
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK }}
      
      - name: Notify Slack on failure
        if: failure()
        uses: slackapi/slack-github-action@v1
        with:
          payload: |
            {
              "text": "❌ Deployment failed"
            }
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK }}
```

---

## Best Practices

### 1. **Use Specific Action Versions**
```yaml
# ✅ Good
- uses: actions/checkout@v4

# ❌ Avoid
- uses: actions/checkout@latest
- uses: actions/checkout@main
```

### 2. **Use `npm ci` Instead of `npm install`**
```yaml
# ✅ Good (faster, more reliable)
- run: npm ci

# ❌ Less ideal
- run: npm install
```

### 3. **Security: Minimize Permissions**
```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: read
```

### 4. **Fail Fast with Conditions**
```yaml
steps:
  - name: Stop early if not main branch
    if: github.ref != 'refs/heads/main'
    run: exit 1
```

### 5. **Use Workflow Status Checks**
```yaml
steps:
  - name: This fails on error
    run: some-command-that-might-fail
    continue-on-error: true  # Don't stop workflow
  
  - name: Continue even if above failed
    run: echo "Still running"
```

### 6. **Keep Workflows Readable**
```yaml
# Add comments and meaningful step names
- name: 🏗️ Build production bundle
  run: npm run build:prod
```

---

## Complete Example: React App Workflow

Here's a production-ready workflow for your React project:

Create `.github/workflows/ci-cd.yml`:

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

env:
  NODE_VERSION: 18

jobs:
  # Job 1: Lint code
  lint:
    name: Lint Code
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: npm
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run ESLint
        run: npm run lint

  # Job 2: Run tests
  test:
    name: Run Tests
    runs-on: ubuntu-latest
    needs: lint
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: npm
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm test -- --coverage
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3

  # Job 3: Build app
  build:
    name: Build Application
    runs-on: ubuntu-latest
    needs: test
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: npm
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build app
        run: npm run build
      
      - name: Upload build artifacts
        uses: actions/upload-artifact@v3
        with:
          name: build
          path: dist/

  # Job 4: Deploy (only on main branch)
  deploy:
    name: Deploy to Production
    runs-on: ubuntu-latest
    needs: build
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    environment:
      name: production
      url: https://your-site.com
    steps:
      - name: Download build artifacts
        uses: actions/download-artifact@v3
        with:
          name: build
      
      - name: Deploy to Netlify
        uses: netlify/actions/cli@master
        with:
          args: deploy --prod
        env:
          NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
          NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
      
      - name: Notify deployment
        if: success()
        run: echo "✅ Deployment successful!"
```

---

## Troubleshooting

### Common Issues and Solutions

#### 1. **Workflow Not Triggering**

**Problem**: Workflow file exists but not running.

**Solutions**:
- Check file is in `.github/workflows/` folder
- Verify event trigger syntax is correct
- Check branch name matches (e.g., `main` vs `master`)
- Branch must exist when you add the workflow
- Ensure YAML syntax is valid (use YAML validator)

#### 2. **npm install Fails**

**Problem**: "npm: command not found" or package install errors.

**Solution**: Ensure Node.js setup step comes before npm commands:
```yaml
- uses: actions/setup-node@v4
  with:
    node-version: 18
```

#### 3. **Secret Not Available**

**Problem**: `${{ secrets.SECRET_NAME }}` returns empty.

**Solutions**:
- Verify secret is created in repo settings
- Check exact secret name matches
- Ensure secret is set in correct repo (not organization)
- Pull requests from forks cannot access secrets (by design)

#### 4. **Timeout Issues**

**Problem**: Workflow times out (default 6 hours).

**Solution**:
```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    timeout-minutes: 30  # Set custom timeout
```

#### 5. **Permissions Denied**

**Problem**: "Permission denied" when deploying.

**Solution**: Use PAT (Personal Access Token) with correct scopes:
```yaml
env:
  GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}  # Or PAT
```

---

## FlowerBoom GitHub Pages Setup

Use these steps for this project specifically.

### Step 1: Make sure the workflow exists

The deploy workflow is in [.github/workflows/deploy.yml](.github/workflows/deploy.yml). It does 4 things:
1. Checks out the code
2. Configures GitHub Pages
3. Installs dependencies and builds the React app
4. Uploads the `dist/` folder and deploys it

### Step 2: Enable GitHub Pages in the repository settings

1. Open the repository on GitHub.
2. Go to **Settings**.
3. Click **Pages**.
4. Under **Build and deployment**, set **Source** to **GitHub Actions**.
5. Save the setting.

If this is not enabled, `actions/deploy-pages` fails with a 404.

### Step 3: Confirm the app base path matches the repo name

This project is configured for GitHub Pages under `/Flowerboom/`.

The important files are:
- [vite.config.js](vite.config.js)
- [src/App.jsx](src/App.jsx)

If your repository name changes, update both files to match the new Pages path exactly.

### Step 4: Commit and push

```bash
git add .github/workflows/deploy.yml vite.config.js src/App.jsx
git commit -m "Configure GitHub Pages deployment"
git push origin main
```

### Step 5: Watch the workflow in GitHub

1. Open the repository.
2. Click **Actions**.
3. Open the latest run of **Deploy to GitHub Pages**.
4. Check the `build` job first.
5. Check the `deploy` job after the build succeeds.

### Step 6: Verify the site URL

Once deployment succeeds, GitHub Pages will publish the site at the URL shown in the workflow environment.

For this repo, the router basename and Vite base must match the deployed path, otherwise the site may load with missing assets or broken navigation.

### Step 7: If deployment still fails

Use this checklist:
1. Verify Pages is enabled in **Settings > Pages**.
2. Confirm the workflow file is on the `main` branch.
3. Check that the `dist/` folder is created by `npm run build`.
4. Make sure the repo path casing matches exactly.
5. Re-run the workflow after changing settings.

---

## Custom Domain Setup

Use this if you want the site on your own domain, such as `www.example.com`.

### Step 1: Enable Pages first

Before using a custom domain, the repo must already be publishing through GitHub Pages.

### Step 2: Add the custom domain in GitHub

1. Open the repository on GitHub.
2. Go to **Settings**.
3. Click **Pages**.
4. In **Custom domain**, type your domain name.
5. Save the setting.

GitHub will create or expect a `CNAME` record for the site.

### Step 3: Update your DNS provider

For a root domain like `example.com`, point it to GitHub Pages using A records.

For a subdomain like `www.example.com`, point it with a CNAME record.

Common setup:
1. Add A records for `@` to GitHub Pages IP addresses.
2. Add a CNAME record for `www` pointing to your GitHub Pages domain.

### Step 4: Change the app base path

This project currently uses a GitHub Pages subpath:
- [vite.config.js](vite.config.js) uses `/Flowerboom/`
- [src/App.jsx](src/App.jsx) uses `/Flowerboom`

If you switch to a custom domain, change both to `/` or remove the basename so the app loads from the domain root.

### Step 5: Rebuild and redeploy

After changing the domain settings and app path:
1. Commit the code change.
2. Push to `main`.
3. Wait for the workflow to finish.
4. Open the custom domain in the browser.

### Step 6: If the domain does not load

Check these first:
1. DNS changes can take time to propagate.
2. The domain in GitHub Pages settings must match the DNS record.
3. The app must not still point to `/Flowerboom/`.
4. HTTPS can take a few minutes to become available.

---

## Next Steps

1. **Create your first workflow**: Start simple (lint/test)
2. **Add to your project**: Create `.github/workflows/` folder
3. **Push to GitHub**: Commit and push the workflow
4. **Monitor execution**: Watch **Actions** tab
5. **Iterate**: Add more jobs as needed
6. **Set up secrets**: Configure sensitive data in repo settings
7. **Share workflows**: Use actions from marketplace

---

## Useful Resources

- **GitHub Actions Docs**: https://docs.github.com/en/actions
- **Marketplace Actions**: https://github.com/marketplace?type=actions
- **YAML Validator**: https://codebeautify.org/yaml-validator
- **Cron Syntax**: https://crontab.guru/

---

## Summary

| Concept | Purpose |
|---------|---------|
| **Workflow** | YAML file defining automation |
| **Event** | Trigger (push, PR, schedule, etc.) |
| **Job** | Group of steps running together |
| **Step** | Individual task (run command or action) |
| **Action** | Reusable unit of code |
| **Runner** | Machine executing workflow |
| **Secret** | Sensitive data (API keys, tokens) |
| **Artifact** | Files generated/saved in workflow |

GitHub Actions automates your development lifecycle. Start simple, add complexity gradually!
