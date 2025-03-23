FROM node:18-alpine AS builder


WORKDIR /app

# Copy package files first
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm install

# Copy source files
COPY src ./src
COPY server ./server
COPY tsconfig.json ./

# Generate Prisma client
# RUN npx prisma generate

# Build the application
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"] 