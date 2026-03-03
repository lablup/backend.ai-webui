# Installation and Setup

Learn how to install and configure the Backend.AI Python SDK for programmatic access to the platform.

## Installation

### Prerequisites
- Python 3.7 or later
- pip package manager
- Active Backend.AI account
- API credentials

### Install from PyPI
```bash
# Install latest stable version
pip install backend.ai-client

# Install specific version
pip install backend.ai-client==23.09.1

# Install with additional features
pip install "backend.ai-client[dev]"
```

### Install from Source
```bash
# Clone repository
git clone https://github.com/lablup/backend.ai-client-py.git
cd backend.ai-client-py

# Install in development mode
pip install -e .
```

## Configuration

### Environment Variables
```bash
export BACKEND_AI_ENDPOINT="https://api.backend.ai"
export BACKEND_AI_ACCESS_KEY="AKIAIOSFODNN7EXAMPLE"
export BACKEND_AI_SECRET_KEY="wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
```

### Configuration File
Create `~/.backend.ai/config.toml`:
```toml
[api]
endpoint = "https://api.backend.ai"
version = "v4"

[session]
default_timeout = 30

[auth]
access_key = "AKIAIOSFODNN7EXAMPLE"
secret_key = "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
```

## Basic Usage

### Client Initialization
```python
from backend.ai.client import Client

# Using environment variables
client = Client()

# Explicit configuration
client = Client(
    endpoint="https://api.backend.ai",
    access_key="your-access-key",
    secret_key="your-secret-key"
)
```

### Testing Connection
```python
# Test API connectivity
try:
    result = client.auth.test()
    print(f"Connection successful: {result}")
except Exception as e:
    print(f"Connection failed: {e}")
```

## Advanced Configuration

### Custom Endpoints
```python
# Development server
client = Client(endpoint="http://localhost:8081")

# Custom domain
client = Client(endpoint="https://backend-ai.company.com")
```

### Proxy Configuration
```python
import backend.ai.client as bai

# Configure HTTP proxy
client = Client(
    endpoint="https://api.backend.ai",
    proxy="http://proxy.company.com:8080"
)
```

For usage examples, see [Session Operations](sessions.md) and [Storage Operations](storage.md).