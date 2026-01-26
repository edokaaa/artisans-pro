# -------- Base --------
FROM node:20-alpine AS base
WORKDIR /app

# -------- Dependencies --------
FROM base AS deps
COPY package*.json ./
RUN npm ci --omit=dev

# -------- Build --------
FROM base AS build
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# -------- Runtime --------
FROM node:20-alpine AS runtime
WORKDIR /app

ENV APP_ENV=production

COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/keys ./keys
COPY package*.json ./

# Run migrations and then start the app
CMD ["sh", "-c", "npm run migration:run && node dist/main.js"]

