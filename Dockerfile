# ---- Build stage ----
FROM node:20-alpine AS build
WORKDIR /app

# Vite inlines VITE_* values into the bundle at build time, so they must be present here (not at container runtime).
# Pass them with --build-arg; any left empty fall back to the .env file in the build context.
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ARG VITE_ENTRA_TENANT_ID
ARG VITE_ENTRA_CLIENT_ID
ARG VITE_ENTRA_AUTHORITY
ARG VITE_ENTRA_API_SCOPE
ARG VITE_DEV_MODE

COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

COPY . .

# Empty build args are unset because Vite lets any defined env var (even "") override .env.
# Without a dev-mode override, the build fails fast if the Entra IDs are missing.
RUN set -e; \
    for v in VITE_SUPABASE_URL VITE_SUPABASE_ANON_KEY VITE_ENTRA_TENANT_ID VITE_ENTRA_CLIENT_ID VITE_ENTRA_AUTHORITY VITE_ENTRA_API_SCOPE VITE_DEV_MODE; do \
      eval "val=\${$v:-}"; \
      if [ -z "$val" ]; then unset "$v"; fi; \
    done; \
    envval() { eval "val=\${$1:-}"; [ -n "$val" ] && echo "$val" || sed -n "s/^$1=//p" .env 2>/dev/null | tail -n1; }; \
    if [ "$(envval VITE_DEV_MODE)" != "true" ]; then \
      [ -n "$(envval VITE_ENTRA_TENANT_ID)" ] || { echo "VITE_ENTRA_TENANT_ID is required (or set VITE_DEV_MODE=true)"; exit 1; }; \
      [ -n "$(envval VITE_ENTRA_CLIENT_ID)" ] || { echo "VITE_ENTRA_CLIENT_ID is required (or set VITE_DEV_MODE=true)"; exit 1; }; \
    fi; \
    npm run build

# ---- Runtime stage ----
FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
