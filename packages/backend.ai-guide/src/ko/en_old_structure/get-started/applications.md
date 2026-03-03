# Using Applications

Backend.AI provides access to a variety of pre-configured applications and development environments. These applications run within isolated compute sessions, giving you powerful tools for development, research, and data analysis.

## Available Applications

### Development Environments

**Jupyter Notebook**
- Interactive Python development
- Data visualization and analysis
- Machine learning experiments
- Support for multiple kernels

**JupyterLab**
- Advanced Jupyter interface
- File browser and terminal access
- Extension ecosystem
- Collaborative features

**Visual Studio Code Server**
- Full IDE experience in browser
- Extension support
- Integrated terminal
- Git integration

**RStudio Server**
- R statistical computing environment
- Interactive data analysis
- Package management
- Report generation

### Terminal Access

**Web Terminal**
- Command-line interface in browser
- Full shell environment
- File system access
- System administration tools

**SSH Access** (if enabled)
- Connect using standard SSH clients
- Port forwarding capabilities
- Secure file transfer (SFTP)
- External tool integration

### Specialized Applications

**TensorBoard**
- Machine learning experiment visualization
- Model architecture inspection
- Training metrics monitoring
- Hyperparameter comparison

**MLflow**
- Experiment tracking
- Model registry
- Deployment management
- Collaboration tools

**Apache Zeppelin**
- Web-based notebook interface
- Multiple language support
- Data visualization
- Collaboration features

## Starting Applications

### From Session Creation

1. Select your desired kernel/environment
2. Choose application type during session creation
3. Configure resource requirements
4. Launch the session

### Service Ports

Applications automatically expose service ports that allow you to access their web interfaces directly from your browser.

### Application Launcher

Some environments provide an application launcher that gives you quick access to multiple tools within a single session.

## Best Practices

### Resource Planning
- Consider memory requirements for data-intensive applications
- GPU allocation for machine learning workloads
- CPU cores for parallel processing tasks

### Data Organization
- Mount relevant storage folders before starting
- Organize project files in shared folders for collaboration
- Use version control for code and configuration

### Security Considerations
- Be aware of exposed service ports
- Use secure authentication methods
- Avoid storing sensitive data in session environments

Each application runs in an isolated environment, ensuring that your work doesn't interfere with other users while providing access to the tools you need for productive development and research.