# Multi-stage Dockerfile for Agiemme Planner Backend
# Base: Node.js 20 Alpine for minimal size
# Development target with hot-reload support

FROM node:20-alpine AS base

# Install PostgreSQL client for pg_isready and psql commands
RUN apk add --no-cache postgresql-client curl

WORKDIR /app

# Copy package files for dependency installation
COPY package*.json ./

# Development stage
FROM base AS development

# Install all dependencies (including devDependencies for tsx, typescript)
RUN npm ci

# Copy source code
COPY . .

# Copy and set permissions for entrypoint script
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Expose backend port
EXPOSE 3000

# Set entrypoint
ENTRYPOINT ["docker-entrypoint.sh"]

# Default command (can be overridden in docker-compose.yml)
CMD ["npm", "run", "dev"]
