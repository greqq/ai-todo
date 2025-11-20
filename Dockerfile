# ============================================
# Multi-Stage Docker Build for Next.js
# ============================================
# Why multi-stage? 
# - Smaller final image (only production dependencies)
# - Faster builds (layers are cached)
# - More secure (no dev tools in production)

# ============================================
# Stage 1: Dependencies
# ============================================
# This stage installs ALL dependencies (including devDependencies)
# We need devDependencies to build Next.js

FROM node:20-alpine AS deps

# Install libc6-compat for compatibility with some npm packages
# Alpine is a minimal Linux distro (5MB vs 100MB for Ubuntu)
RUN apk add --no-cache libc6-compat

# Set working directory inside the container
WORKDIR /app

# Copy package files
# Why copy these first? Docker caches layers!
# If package.json doesn't change, this layer is reused
COPY package.json package-lock.json* ./

# Install dependencies
# --frozen-lockfile ensures exact versions from lock file
RUN npm ci --frozen-lockfile

# ============================================
# Stage 2: Builder
# ============================================
# This stage builds the Next.js application

FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependencies from deps stage
# This is faster than installing again
COPY --from=deps /app/node_modules ./node_modules

# Copy all source code
COPY . .

# Set environment variable for Next.js
# This tells Next.js we're building for production
ENV NEXT_TELEMETRY_DISABLED 1

# Build the application
# This creates the optimized .next folder
RUN npm run build

# ============================================
# Stage 3: Runner (Final Production Image)
# ============================================
# This is the actual image that will run in production
# It's much smaller because it only has production dependencies

FROM node:20-alpine AS runner

WORKDIR /app

# Don't run as root (security best practice)
# Create a group and user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy only necessary files from builder
# public folder (static assets)
COPY --from=builder /app/public ./public

# Set correct ownership for Next.js cache and standalone files
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Copy the standalone build output
# Next.js standalone mode creates a minimal server
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Switch to non-root user
USER nextjs

# Expose port 3000
# This is the port Next.js runs on
EXPOSE 3000

# Set environment variable for port
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# Health check (AWS ECS uses this to verify container is healthy)
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start the application
# This runs the Next.js standalone server
CMD ["node", "server.js"]
