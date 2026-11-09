# --- Build stage ---
FROM node:20-alpine AS build
WORKDIR /app

# Vite bakes VITE_* values into the bundle at build time, so they must be present here.
# Values passed with --build-arg take priority; anything not passed falls back to the copied .env file.
ARG VITE_ENTRA_TENANT_ID
ARG VITE_ENTRA_CLIENT_ID
ARG VITE_AUTH_DEV_MODE
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY

COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

COPY . .
RUN if [ "$VITE_AUTH_DEV_MODE" = "true" ]; then echo "WARNING: building with Entra sign-in disabled (VITE_AUTH_DEV_MODE=true)"; fi \
 && npm run build

# --- Runtime stage ---
FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
