#!/bin/sh
set -e

# Ensure correct ownership for nginx runtime directories
chown -R nginx:nginx /usr/share/nginx/html /var/cache/nginx /var/run /var/log/nginx || true

# If PORT is set, patch nginx config to listen on that port
if [ -n "$PORT" ] && [ "$PORT" != "8080" ]; then
  sed -i "s/listen 8080;/listen ${PORT};/g" /etc/nginx/conf.d/default.conf || true
fi

# Drop privileges to nginx user and exec the command
exec "$@"
