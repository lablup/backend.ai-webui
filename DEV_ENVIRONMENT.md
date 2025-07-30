# 🚀 Multi-Instance Development Environment

Simple configuration system for running multiple Backend.AI WebUI development servers simultaneously without port conflicts and with visual theme differentiation.

## ✨ Features

- **Simple Port Configuration**: Manual port offset via environment variables (defaults to 0)
- **Optional Theme Color**: Custom header colors when specified
- **Host Configuration**: Support for custom host addresses (defaults to localhost)
- **Environment-Based**: Clean configuration via environment variables
- **Multi-Instance Support**: Run multiple dev servers with different configurations

## 🛠 Usage

### 1. Basic Usage (Default Configuration)

```bash
# Check current configuration
node scripts/dev-config.js show

# Start development server (uses current configuration)
pnpm run server:d
```

### 2. Environment Configuration

Set environment variables directly or create `.env.development.local` file:

```bash
# Custom port offset (defaults to 0 if not set)
BAI_WEBUI_DEV_PORT_OFFSET=10

# Custom theme color (hex format) - optional
THEME_HEADER_COLOR=#9370DB  

# Custom host (defaults to localhost if not set)
HOST=192.168.1.100
```

### 3. Export Variables for Shell

```bash
# Export environment variables for current shell
eval "$(node scripts/dev-config.js env)"

# Check what variables are exported
node scripts/dev-config.js env
```

## 📡 Port Configuration

### Base Ports
- React dev server: `9081`
- WebDev server: `3081`

### With Port Offset
When `BAI_WEBUI_DEV_PORT_OFFSET=20` is set:
- React dev server: `9101` (9081 + 20)
- WebDev server: `3101` (3081 + 20)

## 🎨 Theme Customization

Set custom header colors using `THEME_HEADER_COLOR` environment variable:

```bash
# Purple theme
THEME_HEADER_COLOR=#9370DB

# Green theme  
THEME_HEADER_COLOR=#32CD32

# Red theme
THEME_HEADER_COLOR=#DC143C
```

The theme color will override the default header background in development mode.

## 🌐 Host Configuration

By default, servers bind to `localhost`. For remote access:

```bash
# Allow access from any IP
HOST=0.0.0.0

# Bind to specific IP
HOST=192.168.1.100
```

## 🔧 Environment Variables

The system uses `BAI_WEBUI_DEV_*` prefixed environment variables internally:

- `BAI_WEBUI_DEV_REACT_PORT` - React development server port
- `BAI_WEBUI_DEV_WEBDEV_PORT` - WebDev server port  
- `BAI_WEBUI_DEV_HOST` - Host address
- `BAI_WEBUI_DEV_THEME_COLOR` - Theme color
- `BAI_WEBUI_DEV_PROXY` - Proxy URL for React development server

These are automatically generated from your configuration.

## 📝 Examples

### Example 1: Default Configuration
```bash
# Check default settings
node scripts/dev-config.js show
# Output:
# 🚀 Backend.AI WebUI Development Configuration
# 🌐 Host: localhost  
# 📡 Ports:
#    React: 9081
#    WebDev: 3081
# 🔢 Port Offset: +0
```

### Example 2: Custom Configuration
```bash
# Set custom configuration
export BAI_WEBUI_DEV_PORT_OFFSET=30
export THEME_HEADER_COLOR=#9370DB
export HOST=192.168.1.100

# Check updated settings
node scripts/dev-config.js show
# Output:
# 🚀 Backend.AI WebUI Development Configuration  
# 🌐 Host: 192.168.1.100
# 🎨 Theme Color: #9370DB [colored block]
# 📡 Ports:
#    React: 9111
#    WebDev: 3111  
# 🔢 Port Offset: +30
```

### Example 3: Multiple Instances
```bash
# Terminal 1: Default instance
cd webui-ai
pnpm run server:d
# → React: 9081, WebDev: 3081

# Terminal 2: Feature instance with offset
cd webui-ai-feature  
echo "BAI_WEBUI_DEV_PORT_OFFSET=10" > .env.development.local
echo "THEME_HEADER_COLOR=#32CD32" >> .env.development.local
pnpm run server:d
# → React: 9091, WebDev: 3091, Green header

# Terminal 3: Debug instance with different offset
cd webui-ai-debug
echo "BAI_WEBUI_DEV_PORT_OFFSET=20" > .env.development.local  
echo "THEME_HEADER_COLOR=#DC143C" >> .env.development.local
pnpm run server:d
# → React: 9101, WebDev: 3101, Red header
```

## 🚨 Important Notes

- `.env.development.local` is not tracked by git (personal settings)
- Environment variables take precedence over `.env.development.local` file
- Server restart required after configuration changes
- Theme colors only apply in development mode
- Port offset defaults to 0 when `BAI_WEBUI_DEV_PORT_OFFSET` is not set
- Theme color is optional - no color applied when not specified

## 🔧 Script Commands

```bash
# Show current configuration
node scripts/dev-config.js show

# Export environment variables  
node scripts/dev-config.js env

# Update and show configuration
node scripts/dev-config.js update
```

Now you can run multiple development environments simultaneously without port conflicts, each with distinct visual themes! 🎉