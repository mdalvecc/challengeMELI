# ---- Builder stage ----
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --ignore-scripts

# Copy the rest of the source code
COPY . .

# Build (includes postbuild steps to copy schema and data into dist)
RUN npm run build

# ---- Runtime stage ----
FROM node:20-alpine AS runner

ENV NODE_ENV=production
WORKDIR /app

# Only install production dependencies
COPY --chown=node:node package*.json ./
RUN npm ci --omit=dev --ignore-scripts

# Create a non-root user (node image already has user `node`)
USER node

# Copy built artifact from builder
COPY --from=builder --chown=node:node /app/dist ./dist

# Default port
EXPOSE 4000

CMD ["node", "dist/index.js"]
