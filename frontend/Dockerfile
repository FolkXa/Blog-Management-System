# Frontend Dockerfile
FROM node:18-alpine AS build
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* .npmrc* ./
RUN npm ci || npm install

# Build
COPY . .
# Accept build-time API base override
ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}
RUN npm run build

# Serve built files with a tiny static server
FROM node:18-alpine AS runner
WORKDIR /app
RUN npm i -g serve@14.2.3
COPY --from=build /app/dist ./dist
EXPOSE 5173
CMD ["serve", "-s", "dist", "-l", "5173"]
