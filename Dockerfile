FROM nginx:stable-alpine

# Runtime-only image: expects a pre-built `dist/` in the build context
ARG PORT=8080
ENV PORT=${PORT}

# Copy built assets from build context
COPY dist /usr/share/nginx/html
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY docker/entrypoint.sh /usr/local/bin/entrypoint.sh

# Install su-exec and curl for entrypoint/healthcheck
RUN apk add --no-cache su-exec curl \
  && chmod +x /usr/local/bin/entrypoint.sh \
  && chown -R nginx:nginx /usr/share/nginx/html /var/cache/nginx /var/run /var/log/nginx

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD /bin/sh -c 'curl -f http://127.0.0.1:${PORT}/ || exit 1'

USER root
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
