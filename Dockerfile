# syntax=docker/dockerfile:1

# ---- Build stage ----
FROM node:20-alpine AS build
WORKDIR /app

# Vite inlines VITE_* values into the bundle at build time, so they must be present here (not at container runtime).
# Pass them with --build-arg or let docker compose read them from .env (see docker-compose.yml).
ARG VITE_ENTRA_TENANT_ID
ARG VITE_ENTRA_CLIENT_ID
ARG VITE_ENTRA_AUTHORITY=""
ARG VITE_ENTRA_API_SCOPE=""
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY

ENV VITE_ENTRA_TENANT_ID=$VITE_ENTRA_TENANT_ID \
    VITE_ENTRA_CLIENT_ID=$VITE_ENTRA_CLIENT_ID \
    VITE_ENTRA_AUTHORITY=$VITE_ENTRA_AUTHORITY \
    VITE_ENTRA_API_SCOPE=$VITE_ENTRA_API_SCOPE \
    VITE_SUPABASE_URL=$VITE_SUPABASE_URL \
    VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

RUN test -n "$VITE_ENTRA_TENANT_ID" && test -n "$VITE_ENTRA_CLIENT_ID" \
    || (echo "VITE_ENTRA_TENANT_ID and VITE_ENTRA_CLIENT_ID build args are required" && exit 1)
RUN npm run build

# ---- Runtime stage ----
FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
