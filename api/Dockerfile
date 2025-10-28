# Use official Node.js image
FROM node:22-alpine

# Set working directory inside container
WORKDIR /app

# Install Azure Functions Core Tools
RUN npm install -g azure-functions-core-tools@4 --unsafe-perm true

# Copy dependency files
COPY package*.json ./

# Install dependencies
RUN npm ci --omit=dev

# Copy source code
COPY . .

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs
RUN adduser -S azureuser -u 1001
USER azureuser

# Expose API port
EXPOSE 7071

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:7071/api/health || exit 1

# Define startup command
CMD ["func", "start", "--host", "0.0.0.0", "--port", "7071"]
