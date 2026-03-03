# Common Issues

Solutions to frequently encountered problems when using Backend.AI platform.

## Installation Issues

### Docker Installation Problems

**Problem**: Docker service not running
```bash
# Check Docker status
sudo systemctl status docker

# Start Docker service
sudo systemctl start docker
sudo systemctl enable docker
```

**Problem**: Permission denied accessing Docker
```bash
# Add user to docker group
sudo usermod -aG docker $USER

# Logout and login again, or run:
newgrp docker
```

### Network Connectivity Issues

**Problem**: Cannot reach Backend.AI services
```bash
# Test network connectivity
ping api.backend.ai
curl -I https://api.backend.ai

# Check firewall settings
sudo ufw status
sudo iptables -L
```

## Session Issues

### Session Creation Failures

**Problem**: "No available resources" error
- Check resource availability in admin panel
- Verify user quotas and limits
- Review scaling group status
- Check agent node health

**Problem**: Container image not found
```bash
# Check available images
backend.ai admin image list

# Pull missing image
docker pull registry.backend.ai/python:3.9-ubuntu20.04
```

### Session Performance Problems

**Problem**: Slow session startup
- Check agent node resources
- Verify image size and caching
- Review network bandwidth
- Monitor disk I/O performance

**Problem**: Out of memory errors
- Increase session memory allocation
- Optimize code memory usage
- Check for memory leaks
- Monitor system memory usage

## Storage Issues

### Virtual Folder Problems

**Problem**: Cannot create virtual folder
```bash
# Check storage backend status
backend.ai admin storage list

# Verify user quotas
backend.ai admin user quota-check user@example.com
```

**Problem**: File upload failures
- Verify folder permissions
- Check available storage space
- Test network connectivity
- Review file size limits

### Mount Issues

**Problem**: Folder not mounted in session
- Check auto-mount configuration
- Verify folder permissions
- Review mount path conflicts
- Test manual mounting

## Authentication Issues

### Login Problems

**Problem**: Invalid credentials error
```bash
# Verify credentials
backend.ai auth test

# Reset password
backend.ai admin user set-password user@example.com
```

**Problem**: API key not working
- Check key expiration date
- Verify key permissions
- Test with different endpoint
- Generate new API key

### Permission Denied Errors

**Problem**: Insufficient permissions
- Review user role assignments
- Check resource policy limits
- Verify group memberships
- Contact administrator

## Performance Issues

### Slow API Responses

**Problem**: High API latency
- Check server load
- Monitor network connectivity
- Review database performance
- Scale manager instances

### Resource Utilization Problems

**Problem**: High CPU/memory usage
- Monitor resource allocation
- Review session resource usage
- Optimize workload efficiency
- Scale agent nodes

## Network Issues

### Connectivity Problems

**Problem**: Cannot connect to Web UI
```bash
# Check service status
curl -I http://localhost:8080

# Verify port accessibility
netstat -tlnp | grep :8080

# Test from different network
nslookup your-backend-ai-domain.com
```

**Problem**: API timeouts
- Increase timeout settings
- Check network latency
- Monitor server performance
- Review proxy configurations

## Database Issues

### Connection Problems

**Problem**: Database connection failed
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Test database connectivity
psql -h localhost -U postgres -d backend_ai
```

**Problem**: Database migration errors
- Backup database before migration
- Check migration logs
- Verify database permissions
- Contact support for assistance

## Diagnostic Tools

### System Health Checks

```bash
# Check Backend.AI services
backend.ai admin status

# Monitor system resources
htop
iostat -x 1
free -h

# Check logs
journalctl -u backend.ai-manager
tail -f /var/log/backend.ai/
```

### Network Diagnostics

```bash
# Test connectivity
ping -c 4 api.backend.ai
traceroute api.backend.ai
nslookup api.backend.ai

# Check port accessibility
telnet api.backend.ai 443
nc -zv api.backend.ai 443
```

## Getting Help

### Log Collection

Before contacting support, collect relevant logs:
```bash
# System logs
sudo journalctl -xe > system-logs.txt

# Backend.AI logs
sudo find /var/log -name "*backend*" -exec cat {} \; > backend-ai-logs.txt

# Container logs
docker logs backend-ai-manager > manager-logs.txt
```

### Support Channels

- **Documentation**: Check relevant guide sections
- **Community Forum**: Search existing discussions
- **GitHub Issues**: Report bugs and feature requests
- **Enterprise Support**: Contact professional support team

For additional troubleshooting guides:
- [Installation Problems](installation.md)
- [Session Problems](sessions.md)
- [Storage Problems](storage.md)