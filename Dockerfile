# Compatible with the classic Docker builder: no BuildKit-only COPY flags; permissions are set with RUN while root.

# ---- Build stage ----
# No IDs or secrets are needed here: public settings are read at container start (see docker/40-runtime-config.sh).
FROM node:20-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# ---- Runtime stage ----
# Unprivileged nginx: runs as uid 101 and listens on 8080; pid and temp files live in /tmp.
FROM nginxinc/nginx-unprivileged:1.30-alpine

USER root
RUN apk add --no-cache jq \
 && mkdir -p /usr/share/nginx/runtime \
 && chown 101:0 /usr/share/nginx/runtime \
 && chmod 0770 /usr/share/nginx/runtime
COPY nginx.conf /etc/nginx/conf.d/default.conf
# Outside conf.d so it is only included inside locations, never at http level.
COPY docker/security-headers.conf /etc/nginx/snippets/security-headers.conf
COPY --from=build /app/dist /usr/share/nginx/html
# The nginx image runs every script in /docker-entrypoint.d before starting the server.
COPY docker/40-runtime-config.sh /docker-entrypoint.d/40-runtime-config.sh
# Still root here: make the script root-owned and read/execute-only for everyone else.
RUN chown root:root /docker-entrypoint.d/40-runtime-config.sh \
 && chmod 0755 /docker-entrypoint.d/40-runtime-config.sh
# Site files stay root-owned (read-only for nginx); only the runtime settings folder is writable.
USER 101

EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
