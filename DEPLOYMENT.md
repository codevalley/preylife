# Deploying PreyLife to Railway.app

This guide explains how to deploy the PreyLife ecosystem simulation to Railway.app.

## Prerequisites

1. A [Railway.app](https://railway.app/) account
2. [Railway CLI](https://docs.railway.app/develop/cli) installed (optional, but recommended)
3. Git repository with your project

## Deployment Steps

### Option 1: Deploy via Railway Dashboard (Easiest)

1. Log in to your [Railway Dashboard](https://railway.app/dashboard)
2. Click "New Project" > "Deploy from GitHub repo"
3. Select your GitHub repository
4. Railway will automatically detect the configuration and deploy your app
5. Once deployed, click on the deployment and then "Settings" > "Domains" to set up a custom domain or use the Railway-provided URL

### Option 2: Deploy via Railway CLI

1. Install the Railway CLI if you haven't already:
   ```bash
   npm i -g @railway/cli
   ```

2. Login to Railway:
   ```bash
   railway login
   ```

3. Link your project (if you've already created one on Railway):
   ```bash
   railway link
   ```
   
   Or create a new project:
   ```bash
   railway init
   ```

4. Deploy your application:
   ```bash
   railway up
   ```

5. Open your deployed application:
   ```bash
   railway open
   ```

## Environment Variables

No specific environment variables are required for this application to run, as it's a client-side simulation. However, if you need to configure any in the future, you can do so in the Railway dashboard under your project's "Variables" section.

## Troubleshooting

If you encounter any issues during deployment:

1. Check the build logs in the Railway dashboard
2. Ensure all dependencies are correctly listed in package.json
3. Verify that the start script is correctly defined in package.json
4. Check that the server.js file is correctly serving the static files from the dist directory

## Updating Your Deployment

To update your deployment after making changes:

1. Push your changes to GitHub if using the GitHub integration
2. Railway will automatically redeploy your application

Or using the CLI:
```bash
railway up
```

## Monitoring

Railway provides basic monitoring for your application. You can view logs and metrics in the Railway dashboard under your project's "Deployments" section. 