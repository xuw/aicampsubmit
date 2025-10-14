# Deployment Guide - AI+ Bootcamp Submission System

This guide covers deploying the AI+ Bootcamp Submission System using Docker, Docker Compose, or Kubernetes.

## Table of Contents
- [Monolithic Docker Image](#monolithic-docker-image)
- [Docker Compose Deployment](#docker-compose-deployment)
- [Kubernetes Deployment](#kubernetes-deployment)
- [Configuration](#configuration)
- [Health Checks](#health-checks)

## Monolithic Docker Image

The system is packaged as a single Docker image that includes:
- **Frontend**: Built React application served by Nginx
- **Backend**: Node.js/Express API server
- **Nginx**: Web server and reverse proxy

### Architecture
```
┌─────────────────────────────────────┐
│     Docker Container (Port 80)      │
│                                     │
│  ┌──────────────────────────────┐  │
│  │         Nginx (Port 80)      │  │
│  │  - Serves frontend static    │  │
│  │  - Proxies /api to backend   │  │
│  └──────────┬───────────────────┘  │
│             │                       │
│  ┌──────────▼───────────────────┐  │
│  │  Backend (Port 3001)         │  │
│  │  - Node.js/Express API       │  │
│  │  - File uploads handling     │  │
│  └──────────┬───────────────────┘  │
│             │                       │
└─────────────┼───────────────────────┘
              │
    ┌─────────▼─────────┐
    │   PostgreSQL DB   │
    │   (Port 5432)     │
    └───────────────────┘
```

### Building the Image

```bash
# Build the Docker image
docker build -t aibootcamp-submit:latest .

# Tag for Docker Hub (optional)
docker tag aibootcamp-submit:latest xuw/aibootcamp-submit:latest

# Push to Docker Hub (optional)
docker push xuw/aibootcamp-submit:latest
```

### Running Standalone Container

```bash
# Start PostgreSQL first
docker run -d \
  --name aibootcamp-db \
  -e POSTGRES_DB=homework_system \
  -e POSTGRES_USER=homework_user \
  -e POSTGRES_PASSWORD=homework_secure_password_123 \
  -p 5432:5432 \
  postgres:15-alpine

# Start the application
docker run -d \
  --name aibootcamp-app \
  --link aibootcamp-db:db \
  -e DB_HOST=db \
  -e DB_PASSWORD=homework_secure_password_123 \
  -e JWT_SECRET=your_jwt_secret_minimum_32_chars \
  -p 8080:80 \
  aibootcamp-submit:latest
```

Access the application at: http://localhost:8080

## Docker Compose Deployment

The recommended way to deploy locally or for development/testing.

### Quick Start

```bash
# Build and start all services
docker-compose -f docker-compose.monolithic.yml up -d

# View logs
docker-compose -f docker-compose.monolithic.yml logs -f

# Stop services
docker-compose -f docker-compose.monolithic.yml down

# Stop and remove volumes (clean slate)
docker-compose -f docker-compose.monolithic.yml down -v
```

### Configuration

Edit `docker-compose.monolithic.yml` to customize:

```yaml
environment:
  # Change JWT secret (REQUIRED for production)
  JWT_SECRET: your_secure_jwt_secret_here

  # Change database password (REQUIRED for production)
  DB_PASSWORD: your_secure_password_here

  # Adjust file upload size (in bytes)
  MAX_FILE_SIZE: 10485760  # 10MB

  # Configure CORS (use specific domain in production)
  CORS_ORIGIN: "https://yourdomain.com"
```

### Accessing the Application

- **Application**: http://localhost:8080
- **Database**: localhost:5432

### Default Login Credentials

After deployment, use these credentials:

- **Admin**: admin@aibootcamp.edu / admin123
- **Instructor**: instructor@aibootcamp.edu / admin123
- **TA**: ta@aibootcamp.edu / admin123
- **Student**: student@aibootcamp.edu / admin123

⚠️ **Change these passwords in production!**

## Kubernetes Deployment

For production deployments with high availability and auto-scaling.

### Prerequisites

- Kubernetes cluster (1.24+)
- kubectl configured
- StorageClass for PersistentVolumes
- (Optional) Ingress controller (nginx)
- (Optional) cert-manager for TLS certificates

### Quick Deploy

```bash
# Deploy everything
kubectl apply -f k8s-deployment.yaml

# Check deployment status
kubectl get pods -n aibootcamp

# View logs
kubectl logs -n aibootcamp -l app=aibootcamp --follow

# Get service URL
kubectl get svc -n aibootcamp aibootcamp-service
```

### Configuration

#### 1. Update Secrets

**REQUIRED before production deployment:**

```bash
# Generate a secure JWT secret
JWT_SECRET=$(openssl rand -base64 32)

# Update the secret
kubectl create secret generic aibootcamp-secrets \
  --from-literal=DB_PASSWORD=your_secure_password \
  --from-literal=JWT_SECRET=$JWT_SECRET \
  -n aibootcamp \
  --dry-run=client -o yaml | kubectl apply -f -
```

#### 2. Configure Ingress (Optional)

Edit the Ingress section in `k8s-deployment.yaml`:

```yaml
spec:
  tls:
  - hosts:
    - your-domain.com  # Change this
    secretName: aibootcamp-tls
  rules:
  - host: your-domain.com  # Change this
```

Then apply:

```bash
kubectl apply -f k8s-deployment.yaml
```

#### 3. Verify Deployment

```bash
# Check all resources
kubectl get all -n aibootcamp

# Check pod status
kubectl get pods -n aibootcamp

# Check service
kubectl get svc -n aibootcamp

# Check ingress
kubectl get ingress -n aibootcamp

# View application logs
kubectl logs -n aibootcamp deployment/aibootcamp-app

# View database logs
kubectl logs -n aibootcamp deployment/postgres
```

### Scaling

```bash
# Manual scaling
kubectl scale deployment aibootcamp-app --replicas=5 -n aibootcamp

# Check HPA status
kubectl get hpa -n aibootcamp

# Describe HPA
kubectl describe hpa aibootcamp-hpa -n aibootcamp
```

### Updating the Application

```bash
# Update image
kubectl set image deployment/aibootcamp-app \
  app=xuw/aibootcamp-submit:v2.0 \
  -n aibootcamp

# Rollout status
kubectl rollout status deployment/aibootcamp-app -n aibootcamp

# Rollback if needed
kubectl rollout undo deployment/aibootcamp-app -n aibootcamp
```

## Configuration

### Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `NODE_ENV` | Environment (production/development) | `production` | No |
| `PORT` | Backend port | `3001` | No |
| `DB_HOST` | PostgreSQL host | `db` | Yes |
| `DB_PORT` | PostgreSQL port | `5432` | No |
| `DB_USER` | Database user | `homework_user` | Yes |
| `DB_NAME` | Database name | `homework_system` | Yes |
| `DB_PASSWORD` | Database password | - | **Yes** |
| `DATABASE_URL` | Full database URL | - | Yes |
| `JWT_SECRET` | JWT signing secret | - | **Yes** |
| `JWT_EXPIRE` | JWT expiration time | `24h` | No |
| `MAX_FILE_SIZE` | Max upload size (bytes) | `10485760` | No |
| `UPLOAD_DIR` | Upload directory | `/app/backend/uploads` | No |
| `CORS_ORIGIN` | CORS allowed origin | `*` | No |
| `RUN_MIGRATIONS` | Run DB migrations on start | `true` | No |

### Security Recommendations

1. **Change JWT_SECRET**: Generate a secure random string (32+ characters)
2. **Change DB_PASSWORD**: Use a strong password
3. **Configure CORS**: Set specific domain instead of `*`
4. **Enable HTTPS**: Use Ingress with TLS certificates
5. **Update Default Passwords**: Change all user passwords after first login
6. **Secrets Management**: Use Kubernetes Secrets or external secret managers

### Storage Configuration

#### Docker Compose

Volumes are created automatically:
- `postgres_data`: Database storage
- `uploads_data`: File uploads storage

#### Kubernetes

PersistentVolumeClaims:
- `postgres-pvc`: 5Gi for database
- `uploads-pvc`: 10Gi for uploads (ReadWriteMany for multi-pod access)

Adjust sizes in `k8s-deployment.yaml`:

```yaml
resources:
  requests:
    storage: 20Gi  # Increase as needed
```

## Health Checks

The application includes health check endpoints:

### Docker Health Check
```bash
# Check container health
docker ps
```

Healthy containers show `(healthy)` status.

### Kubernetes Probes

**Liveness Probe**: Restarts unhealthy pods
```yaml
livenessProbe:
  httpGet:
    path: /
    port: 80
```

**Readiness Probe**: Removes pod from load balancer if not ready
```yaml
readinessProbe:
  httpGet:
    path: /
    port: 80
```

## Monitoring and Logs

### Docker Compose

```bash
# View all logs
docker-compose -f docker-compose.monolithic.yml logs -f

# View specific service
docker-compose -f docker-compose.monolithic.yml logs -f app

# Check resource usage
docker stats
```

### Kubernetes

```bash
# View pod logs
kubectl logs -n aibootcamp -l app=aibootcamp --tail=100

# Stream logs
kubectl logs -n aibootcamp -l app=aibootcamp -f

# View events
kubectl get events -n aibootcamp --sort-by='.lastTimestamp'

# Check resource usage
kubectl top pods -n aibootcamp
kubectl top nodes
```

## Troubleshooting

### Database Connection Issues

```bash
# Docker Compose
docker-compose -f docker-compose.monolithic.yml exec db psql -U homework_user -d homework_system

# Kubernetes
kubectl exec -it -n aibootcamp deployment/postgres -- psql -U homework_user -d homework_system
```

### Application Not Starting

1. Check logs for errors
2. Verify database is healthy
3. Ensure environment variables are set correctly
4. Check if migrations completed successfully

### File Upload Issues

1. Check upload directory permissions
2. Verify `MAX_FILE_SIZE` setting
3. Check storage capacity
4. Review nginx `client_max_body_size` setting

### Performance Issues

1. Check resource limits/requests
2. Review HPA metrics (Kubernetes)
3. Increase replicas if needed
4. Check database performance
5. Monitor network latency

## Backup and Restore

### Docker Compose

```bash
# Backup database
docker exec aibootcamp-db pg_dump -U homework_user homework_system > backup.sql

# Backup uploads
docker cp aibootcamp-app:/app/backend/uploads ./uploads_backup

# Restore database
cat backup.sql | docker exec -i aibootcamp-db psql -U homework_user homework_system

# Restore uploads
docker cp ./uploads_backup aibootcamp-app:/app/backend/uploads
```

### Kubernetes

```bash
# Backup database
kubectl exec -n aibootcamp deployment/postgres -- \
  pg_dump -U homework_user homework_system > backup.sql

# Restore database
cat backup.sql | kubectl exec -i -n aibootcamp deployment/postgres -- \
  psql -U homework_user homework_system
```

## Production Checklist

- [ ] Change `JWT_SECRET` to secure random value
- [ ] Change `DB_PASSWORD` to strong password
- [ ] Configure `CORS_ORIGIN` to specific domain
- [ ] Set up HTTPS/TLS with valid certificates
- [ ] Change all default user passwords
- [ ] Configure persistent volume backups
- [ ] Set up monitoring and alerting
- [ ] Configure resource limits appropriately
- [ ] Review and adjust replica counts
- [ ] Test disaster recovery procedures
- [ ] Document custom configurations
- [ ] Set up log aggregation
- [ ] Configure network policies (Kubernetes)
- [ ] Enable pod security policies (Kubernetes)

## Support

For issues and questions:
- GitHub: https://github.com/xuw/aicampsubmit
- Documentation: See README.md and SPECIFICATION.md
