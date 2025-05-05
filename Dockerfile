FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci

# Copy source files and build
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# Create production image
FROM node:20-alpine AS production

# Create a non-root user to run the application
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Set working directory and change ownership
WORKDIR /app
RUN chown -R appuser:appgroup /app

# Copy package files and install production dependencies only
COPY package*.json ./
RUN npm ci --production && npm cache clean --force

# Copy built files from the builder stage
COPY --from=builder /app/dist ./dist

# Set environment variables
ENV NODE_ENV=production

# Change to non-root user
USER appuser

# Expose port
EXPOSE 8787

# Run the server
CMD ["node", "dist/index.js"]