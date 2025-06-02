FROM node:20-alpine

WORKDIR /app

# Install system dependencies
RUN apk add --no-cache bash

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy entire project
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Expose ports
EXPOSE 4455 5555

# Default command
CMD ["npm", "start"]

# This is a test comment