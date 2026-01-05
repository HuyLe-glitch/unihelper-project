# ===========================================
# UNIHELPER BACKEND - GOOGLE CLOUD RUN
# ===========================================

# Stage 1: Install dependencies
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Stage 2: Production image
FROM node:20-alpine AS runner
WORKDIR /app

# Security: Create non-root user
RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 expressjs

# Copy dependencies
COPY --from=deps /app/node_modules ./node_modules

# Copy source code
COPY --chown=expressjs:nodejs . .

# Create uploads directory
RUN mkdir -p uploads && chown -R expressjs:nodejs uploads

# Switch to non-root user
USER expressjs

# Cloud Run requires PORT 8080
ENV NODE_ENV=production
ENV PORT=8080
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
    CMD node -e "require('http').get('http://localhost:8080/api/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1))" || exit 1

# Start server
CMD ["node", "src/server.js"]
