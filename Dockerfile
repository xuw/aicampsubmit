# Multi-stage Dockerfile for AI+ Bootcamp Submission System
# Bundles both frontend and backend into a single monolithic image

# Stage 1: Build Frontend
FROM node:18-alpine AS frontend-builder

WORKDIR /app/frontend

# Copy frontend package files
COPY frontend/package*.json ./

# Install frontend dependencies (including dev dependencies for build)
RUN npm ci

# Copy frontend source
COPY frontend/ ./

# Build frontend for production
RUN npm run build

# Stage 2: Build Backend
FROM node:18-alpine AS backend-builder

WORKDIR /app/backend

# Copy backend package files
COPY backend/package*.json ./
COPY backend/tsconfig.json ./

# Install backend dependencies including dev dependencies for build
RUN npm ci

# Copy backend source
COPY backend/src ./src

# Build backend TypeScript
RUN npm run build

# Stage 3: Production Image
FROM node:18-alpine

# Install nginx for serving frontend
RUN apk add --no-cache nginx postgresql-client

# Create app directory
WORKDIR /app

# Copy backend built files and dependencies
COPY --from=backend-builder /app/backend/dist ./backend/dist
COPY --from=backend-builder /app/backend/package*.json ./backend/
COPY backend/init.sql ./backend/
COPY backend/create-default-users.sql ./backend/

# Install only production dependencies for backend
WORKDIR /app/backend
RUN npm ci --only=production

# Copy frontend built files
WORKDIR /app
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Setup nginx configuration
RUN mkdir -p /run/nginx
COPY <<EOF /etc/nginx/http.d/default.conf
server {
    listen 80;
    server_name _;

    # Frontend - serve static files
    location / {
        root /app/frontend/dist;
        try_files \$uri \$uri/ /index.html;
        add_header Cache-Control "no-cache";
    }

    # Backend API - proxy to Node.js
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        client_max_body_size 50M;
    }
}
EOF

# Create uploads directory
RUN mkdir -p /app/backend/uploads && chmod 777 /app/backend/uploads

# Create startup script
COPY <<'EOF' /app/start.sh
#!/bin/sh
set -e

echo "Starting AI+ Bootcamp Submission System..."

# Wait for database to be ready
echo "Waiting for database..."
until PGPASSWORD="$DB_PASSWORD" psql -h "${DB_HOST:-db}" -U "${DB_USER:-homework_user}" -d "${DB_NAME:-homework_system}" -c '\q' 2>/dev/null; do
  echo "Database is unavailable - sleeping"
  sleep 2
done

echo "Database is ready!"

# Run database migrations if needed
if [ "${RUN_MIGRATIONS:-true}" = "true" ]; then
  echo "Running database initialization..."
  PGPASSWORD="$DB_PASSWORD" psql -h "${DB_HOST:-db}" -U "${DB_USER:-homework_user}" -d "${DB_NAME:-homework_system}" -f /app/backend/init.sql 2>/dev/null || echo "Tables already exist"
  PGPASSWORD="$DB_PASSWORD" psql -h "${DB_HOST:-db}" -U "${DB_USER:-homework_user}" -d "${DB_NAME:-homework_system}" -f /app/backend/create-default-users.sql 2>/dev/null || echo "Users already exist"
fi

# Start nginx in background
echo "Starting nginx..."
nginx

# Start backend server
echo "Starting backend server..."
cd /app/backend
exec node dist/server.js
EOF

RUN chmod +x /app/start.sh

# Expose port 80 for nginx (which proxies to backend on 3001)
EXPOSE 80

# Set environment variables defaults
ENV NODE_ENV=production \
    PORT=3001 \
    DB_HOST=db \
    DB_PORT=5432 \
    DB_USER=homework_user \
    DB_NAME=homework_system \
    JWT_EXPIRE=24h \
    MAX_FILE_SIZE=10485760 \
    UPLOAD_DIR=/app/backend/uploads \
    CORS_ORIGIN=*

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost/api/health || exit 1

# Start the application
CMD ["/app/start.sh"]
