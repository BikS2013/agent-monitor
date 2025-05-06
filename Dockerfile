FROM node:20-alpine AS build

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy all files
COPY . .

# Build app - environment variables will be injected at build time
ARG ENV_DATASET_SIZE
ARG ENV_CUSTOM_DATASET_PATH
ARG ENV_ALLOW_UI_DATASET_CHANGE
ARG ENV_PREFER_LOCAL_STORAGE

# Build app
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built assets from the build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx config for SPA routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Environment variables for runtime configuration
ENV ENV_DATASET_SIZE=medium
ENV ENV_CUSTOM_DATASET_PATH=""
ENV ENV_ALLOW_UI_DATASET_CHANGE=true
ENV ENV_PREFER_LOCAL_STORAGE=true

# Create a startup script to handle environment variable substitution
RUN echo '#!/bin/sh' > /docker-entrypoint.sh && \
    echo 'echo "Replacing environment variables in index.html..."' >> /docker-entrypoint.sh && \
    echo 'sed -i "s/%ENV_DATASET_SIZE%/${ENV_DATASET_SIZE:-medium}/g" /usr/share/nginx/html/index.html' >> /docker-entrypoint.sh && \
    echo 'sed -i "s/%ENV_CUSTOM_DATASET_PATH%/${ENV_CUSTOM_DATASET_PATH:-}/g" /usr/share/nginx/html/index.html' >> /docker-entrypoint.sh && \
    echo 'sed -i "s/%ENV_ALLOW_UI_DATASET_CHANGE%/${ENV_ALLOW_UI_DATASET_CHANGE:-true}/g" /usr/share/nginx/html/index.html' >> /docker-entrypoint.sh && \
    echo 'sed -i "s/%ENV_PREFER_LOCAL_STORAGE%/${ENV_PREFER_LOCAL_STORAGE:-true}/g" /usr/share/nginx/html/index.html' >> /docker-entrypoint.sh && \
    echo 'echo "Starting nginx..."' >> /docker-entrypoint.sh && \
    echo 'exec nginx -g "daemon off;"' >> /docker-entrypoint.sh && \
    chmod +x /docker-entrypoint.sh

# Use the entrypoint script
ENTRYPOINT ["/docker-entrypoint.sh"]