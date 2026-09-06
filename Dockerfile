# ==============================================================================
# Stage 1: Build Frontend (Vite + React)
# ==============================================================================
FROM node:20-alpine AS frontend-builder

WORKDIR /app

# Install frontend dependencies
COPY package*.json ./
RUN npm ci

# Copy frontend source code and configuration
COPY vite.config.js index.html ./
COPY src/ ./src/

# Build static production bundle into /app/dist
RUN npm run build

# ==============================================================================
# Stage 2: Production Runtime (Google Cloud Run & Docker ready)
# ==============================================================================
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
# Google Cloud Run injects PORT (defaults to 8080).
ENV PORT=8080

# Install production dependencies for server
COPY server/package*.json ./server/
RUN cd server && npm ci --omit=dev

# Copy backend source code
COPY server/ ./server/

# Copy built frontend static files from builder stage
COPY --from=frontend-builder /app/dist ./dist

# Ensure non-root node user has ownership for container security
RUN chown -R node:node /app
USER node

# Expose port (Cloud Run defaults to 8080)
EXPOSE 8080

# Health check instruction for container runners
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:${PORT}/api/health || exit 1

# Launch the server
CMD ["node", "server/index.js"]
