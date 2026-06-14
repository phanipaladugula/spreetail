# Stage 1: Build React App
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html

# Create a startup script to generate the Nginx config with runtime environment variables
RUN echo '#!/bin/sh' > /start.sh && \
    echo 'cat <<EOF > /etc/nginx/conf.d/default.conf' >> /start.sh && \
    echo 'server {' >> /start.sh && \
    echo '    listen ${PORT:-80};' >> /start.sh && \
    echo '    location / {' >> /start.sh && \
    echo '        root /usr/share/nginx/html;' >> /start.sh && \
    echo '        index index.html index.htm;' >> /start.sh && \
    echo '        try_files \$uri \$uri/ /index.html;' >> /start.sh && \
    echo '    }' >> /start.sh && \
    echo '    location /api/ {' >> /start.sh && \
    echo '        proxy_pass ${BACKEND_URL}/api/;' >> /start.sh && \
    echo '        proxy_set_header Host \$host;' >> /start.sh && \
    echo '        proxy_set_header X-Real-IP \$remote_addr;' >> /start.sh && \
    echo '    }' >> /start.sh && \
    echo '}' >> /start.sh && \
    echo 'EOF' >> /start.sh && \
    echo 'nginx -g "daemon off;"' >> /start.sh

RUN chmod +x /start.sh

# Start the script
CMD ["/start.sh"]
