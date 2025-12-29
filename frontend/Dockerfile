# Multi-stage Dockerfile for Agiemme Planner Frontend
# Base: Node.js 20 Alpine for minimal size
# Development target with Vite HMR support

FROM node:20-alpine AS base

WORKDIR /app

# Copy package files for dependency installation
COPY package*.json ./

# Development stage
FROM base AS development

# Install all dependencies (including devDependencies for Vite, TypeScript)
RUN npm ci

# Copy source code
COPY . .

# Copy and set permissions for entrypoint script
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Expose Vite dev server port
EXPOSE 5173

# Set entrypoint
ENTRYPOINT ["docker-entrypoint.sh"]

# Start Vite dev server with host binding for Docker
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
