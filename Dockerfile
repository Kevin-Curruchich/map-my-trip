FROM node:18-alpine

WORKDIR /workspace

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm i --only=production && npm cache clean --force

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Expose port
EXPOSE 8080

# Start the application
CMD ["node", "/workspace/.output/server/index.mjs"]