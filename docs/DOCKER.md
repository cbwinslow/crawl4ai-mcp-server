# Docker Setup Guide

This guide explains how to set up and use Docker with the Crawl4AI MCP Server for both local development and production environments.

## Prerequisites

Before you begin, ensure you have the following software installed:

1. [Docker](https://docs.docker.com/get-docker/)
2. [Docker Compose](https://docs.docker.com/compose/install/)
3. An API key for the Crawl4AI service

## Local Development Setup

The repository includes a Docker Compose configuration for local development that creates three services:
- A Node.js environment for the MCP Server
- The Crawl4AI API
- A web UI for debugging Crawl4AI requests

### Initial Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/your-org/crawl4ai-mcp-server.git
   cd crawl4ai-mcp-server
   ```

2. Create a `.env` file in the root directory with the following content:
   ```
   CRAWL4AI_API_KEY=your_api_key_here
   ```

3. Start the development environment:
   ```bash
   docker-compose up
   ```

4. Access the services:
   - MCP Server: http://localhost:8787
   - Crawl4AI UI: http://localhost:3000

### Development Workflow

The Docker Compose setup mounts your local `src` directory into the container, so any changes you make to the source code will be automatically detected by Wrangler and the service will reload.

### Testing

To run tests in the Docker environment:

```bash
docker-compose exec mcp-server npm test
```

For watching tests during development:

```bash
docker-compose exec mcp-server npm run test:watch
```

## Production Setup

For production environments, we recommend using the multi-stage Dockerfile provided in the repository.

### Building the Production Image

1. Build the Docker image:
   ```bash
   docker build -t crawl4ai-mcp-server:latest .
   ```

2. Run the container:
   ```bash
   docker run -p 8787:8787 \
     -e CRAWL4AI_API_KEY=your_api_key_here \
     -e CRAWL4AI_API_URL=https://api.crawl4ai.com \
     crawl4ai-mcp-server:latest
   ```

### Configuration Options

The following environment variables can be configured:

| Variable | Description | Default Value |
|----------|-------------|---------------|
| `NODE_ENV` | Environment mode (`development` or `production`) | `production` |
| `CRAWL4AI_API_KEY` | API key for Crawl4AI service | Required |
| `CRAWL4AI_API_URL` | URL of the Crawl4AI API | `http://localhost:11235` |
| `PORT` | Port to run the MCP server on | `8787` |

## Deploying to CloudFlare Workers

Since this project is designed to deploy to CloudFlare Workers, the Docker setup is primarily for local development and testing. For production, we recommend deploying directly to CloudFlare Workers using Wrangler.

1. Configure CloudFlare credentials:
   ```bash
   # Using Wrangler CLI
   wrangler login
   
   # Or set environment variables
   export CLOUDFLARE_API_TOKEN=your_token
   export CLOUDFLARE_ACCOUNT_ID=your_account_id
   ```

2. Deploy to CloudFlare Workers:
   ```bash
   npm run deploy
   ```

## Crawl4AI API Docker Image

The Docker Compose setup uses the official Crawl4AI API Docker image. Here's what you need to know:

### Image Details

- Image: `crawl4ai/api:latest`
- Port: 11235
- Data volume: `/app/data`

### Configuration Options

| Environment Variable | Description | Default Value |
|----------------------|-------------|---------------|
| `CRAWL4AI_API_KEY` | API key for authentication | Required |
| `CRAWL4AI_LOG_LEVEL` | Logging level (DEBUG, INFO, WARNING, ERROR) | `INFO` |
| `CRAWL4AI_ALLOW_ORIGINS` | CORS allowed origins (comma-separated) | `*` |

### Data Persistence

The Crawl4AI API stores crawl data and caches in a volume mounted at `/app/data`. This ensures that data persists between container restarts.

## Troubleshooting

### Common Issues

1. **Connection Refused to Crawl4AI API**
   
   If the MCP server cannot connect to the Crawl4AI API, check that the API container is running and that the URLs are correctly configured:
   
   ```bash
   docker-compose ps
   ```
   
   Also check the logs for more details:
   
   ```bash
   docker-compose logs crawl4ai-api
   ```

2. **Authentication Errors**
   
   If you see authentication errors, verify that the `CRAWL4AI_API_KEY` environment variable is correctly set in both containers:
   
   ```bash
   docker-compose exec crawl4ai-api env | grep CRAWL4AI
   docker-compose exec mcp-server env | grep CRAWL4AI
   ```

3. **Wrangler Development Mode Issues**
   
   If the MCP server isn't reloading properly during development, check the Wrangler logs:
   
   ```bash
   docker-compose logs mcp-server
   ```

### Getting Help

If you encounter persistent issues with the Docker setup:

1. Check the logs of all services: `docker-compose logs`
2. Ensure all containers are running: `docker-compose ps`
3. Restart the entire setup: `docker-compose down && docker-compose up`
4. Contact Crawl4AI support if the issues persist