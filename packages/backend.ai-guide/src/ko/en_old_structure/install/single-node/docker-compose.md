# Using Docker Compose

The Docker Compose installation method is the recommended approach for development, testing, and small production deployments.

## Prerequisites

Before starting, ensure you have:
- Docker Engine 20.10 or later
- Docker Compose 2.0 or later
- 4GB+ available RAM
- 20GB+ available storage
- Internet connectivity

## Quick Start

### 1. Download Backend.AI

```bash
git clone https://github.com/lablup/backend.ai.git
cd backend.ai
```

### 2. Configure Environment

```bash
# Copy the sample environment file
cp configs/sample.env configs/.env

# Edit configuration as needed
nano configs/.env
```

### 3. Start Services

```bash
# Start all services
docker-compose up -d

# Check service status
docker-compose ps
```

### 4. Verify Installation

```bash
# Check service logs
docker-compose logs -f

# Test API connectivity
curl http://localhost:8081/v1/auth/signup-check
```

## Configuration Options

### Environment Variables

Key configuration options in `.env`:

```env
# Database settings
POSTGRES_PASSWORD=your_secure_password

# Redis settings
REDIS_PASSWORD=your_redis_password

# Manager settings
BACKEND_AI_MANAGER_SECRET_KEY=your_secret_key
BACKEND_AI_MANAGER_DB_URL=postgresql://postgres:password@db:5432/backend_ai

# Storage settings
BACKEND_AI_VOLUME_ROOT=/var/lib/backend.ai/volumes
```

### Service Customization

Customize services by editing `docker-compose.yml`:

```yaml
services:
  manager:
    environment:
      - BACKEND_AI_DEBUG=1
    ports:
      - "8081:8081"

  agent:
    environment:
      - BACKEND_AI_AGENT_GPU_COUNT=0
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
```

## GPU Support

To enable GPU support:

### 1. Install NVIDIA Docker

```bash
# Add NVIDIA package repositories
curl -fsSL https://nvidia.github.io/libnvidia-container/gpgkey | \
  sudo gpg --dearmor -o /usr/share/keyrings/nvidia-container-toolkit-keyring.gpg

# Install nvidia-container-toolkit
sudo apt-get update
sudo apt-get install nvidia-container-toolkit

# Configure Docker
sudo nvidia-ctk runtime configure --runtime=docker
sudo systemctl restart docker
```

### 2. Update Docker Compose

```yaml
services:
  agent:
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: all
              capabilities: [gpu]
```

## Troubleshooting

### Common Issues

**Services not starting:**
```bash
# Check logs
docker-compose logs service_name

# Restart services
docker-compose restart
```

**Database connection errors:**
```bash
# Reset database
docker-compose down -v
docker-compose up -d db
# Wait for database to start, then start other services
```

**Port conflicts:**
```bash
# Check port usage
sudo netstat -tlnp | grep :8081

# Modify port mapping in docker-compose.yml
```

## Next Steps

After successful installation:
1. Access the Web UI at http://localhost:8080
2. Complete [first login setup](../../get-started/first-login.md)
3. Create your [first session](../../get-started/first-session.md)

For production deployments, consider:
- [Multi-node installation](../multi-node/cluster.md)
- [Cloud deployments](../cloud/aws.md)
- [Security configuration](../../admin/config/global.md)