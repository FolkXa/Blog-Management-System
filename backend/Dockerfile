# Backend Dockerfile
FROM node:18-alpine

WORKDIR /app

# Install dependencies first
COPY package.json package-lock.json* .npmrc* ./
RUN npm ci || npm install

# Copy source
COPY src ./src

ENV NODE_ENV=production
ENV PORT=4000
EXPOSE 4000

# Use start (not nodemon) in container
CMD ["npm", "start"]
