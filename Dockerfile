# syntax=docker/dockerfile:1

# ---- Build stage ----
# No IDs or secrets are needed here: public settings are read at container start (see docker/40-runtime-config.sh).
FROM node:20-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# ---- Runtime stage ----
FROM nginx:1.27-alpine
RUN apk add --no-cache jq
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
# The nginx image runs every script in /docker-entrypoint.d before starting the server.
COPY --chmod=755 docker/40-runtime-config.sh /docker-entrypoint.d/40-runtime-config.sh
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
