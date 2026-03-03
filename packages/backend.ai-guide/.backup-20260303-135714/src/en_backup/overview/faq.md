# Frequently Asked Questions

Find answers to commonly asked questions about Backend.AI platform, installation, usage, and troubleshooting.

## General Questions

### What is Backend.AI?

Backend.AI is an open-source platform that democratizes AI computing by providing scalable, containerized environments for machine learning and high-performance computing workloads.

### Who can benefit from Backend.AI?

- **Researchers**: Access to powerful computing resources for ML research
- **Developers**: Streamlined development environments for AI applications
- **Organizations**: Cost-effective resource management and collaboration
- **Students**: Learning environments for data science and programming

### What makes Backend.AI different from other platforms?

- **Open Source**: Full transparency and customizability
- **Multi-tenancy**: Secure resource sharing across teams
- **Fractional GPU**: Efficient GPU resource utilization
- **Enterprise Ready**: Production-grade features and support

## Installation and Setup

### What are the minimum system requirements?

- **CPU**: 2 cores minimum, 4+ recommended
- **Memory**: 4GB minimum, 8GB+ recommended
- **Storage**: 20GB minimum, 100GB+ recommended
- **OS**: Linux (Ubuntu 20.04+ preferred)

### Can I install Backend.AI on Windows or macOS?

While Backend.AI is designed for Linux, you can use:
- **Docker Desktop**: Run containers on Windows/macOS
- **WSL2**: Windows Subsystem for Linux
- **Virtual Machines**: Linux VMs on any host OS
- **Cloud Instances**: Linux instances on cloud providers

### Do I need GPU hardware?

GPU hardware is optional but recommended for:
- Deep learning and neural network training
- GPU-accelerated computing
- High-performance scientific computing
- Computer vision and image processing

## Usage and Features

### How do I create my first compute session?

1. Log into the Web UI
2. Navigate to Sessions page
3. Click "Start Session"
4. Select your environment and resources
5. Launch and access your session

For detailed steps, see [Creating Your First Session](../get-started/first-session.md).

### What programming languages are supported?

Backend.AI supports numerous environments:
- **Python**: Data science, ML frameworks (TensorFlow, PyTorch)
- **R**: Statistical computing and analysis
- **Julia**: High-performance scientific computing
- **Java/Scala**: Big data processing
- **C/C++**: Systems programming
- **Custom environments**: Build your own containers

### How does storage work in Backend.AI?

Storage is managed through virtual folders:
- **Persistent Storage**: Data survives session termination
- **Shared Folders**: Collaborate with team members
- **Auto-mounting**: Folders automatically available in sessions
- **Quota Management**: Control storage usage per user

### Can multiple users work on the same project?

Yes, Backend.AI supports collaboration through:
- **Shared Projects**: Multiple users in the same project
- **Shared Storage**: Common data access
- **Resource Pooling**: Shared compute resources
- **Permission Control**: Fine-grained access management

## Administration

### How do I add new users?

Administrators can add users through:
1. Web UI: Admin → User Management → Add User
2. Bulk Import: CSV file upload
3. API Integration: Programmatic user creation
4. Self-Registration: Allow users to register themselves

See [User Registration](../admin/users/registration.md) for details.

### How do I configure resource policies?

Resource policies control user access to computing resources:
1. Navigate to Admin → Resource Policies
2. Create or modify policies
3. Set CPU, memory, GPU limits
4. Assign policies to users or groups

### Can I integrate with existing authentication systems?

Yes, Backend.AI supports:
- **LDAP/Active Directory**: Enterprise authentication
- **OAuth**: Google, GitHub, Microsoft integration
- **SAML**: Custom identity providers
- **API Keys**: Programmatic access

## Performance and Scaling

### How do I scale Backend.AI for more users?

Scaling options include:
- **Add Agent Nodes**: Increase compute capacity
- **Load Balancing**: Distribute workloads
- **Storage Scaling**: Add storage backends
- **Multi-cluster**: Deploy across regions

### What about backup and disaster recovery?

Implement robust backup strategies:
- **Database Backups**: Regular PostgreSQL backups
- **Storage Backups**: Persistent data protection
- **Configuration Backups**: System settings preservation
- **Disaster Recovery Plans**: Business continuity procedures

### How do I monitor system performance?

Backend.AI provides comprehensive monitoring:
- **Resource Utilization**: Real-time metrics
- **User Activity**: Session and usage tracking
- **System Health**: Service status monitoring
- **Cost Analytics**: Resource consumption analysis

## Troubleshooting

### Sessions fail to start

Common causes and solutions:
- **Resource Availability**: Check if resources are available
- **Image Issues**: Verify container images exist
- **Permission Problems**: Review user permissions
- **System Resources**: Check host system capacity

### Storage access problems

Typical issues:
- **Permission Denied**: Check folder permissions
- **Quota Exceeded**: Monitor storage usage
- **Mount Failures**: Verify storage backend connectivity
- **Network Issues**: Check network connectivity

### Performance issues

Optimization strategies:
- **Resource Allocation**: Right-size session resources
- **Code Optimization**: Improve algorithm efficiency
- **System Tuning**: Optimize host system configuration
- **Load Distribution**: Balance workloads across nodes

### Getting help with issues

Support resources:
- **Documentation**: Comprehensive guides and references
- **Community Forum**: User community discussions
- **GitHub Issues**: Bug reports and feature requests
- **Enterprise Support**: Professional support services

## Security and Compliance

### Is Backend.AI secure?

Security features include:
- **Container Isolation**: Secure session separation
- **Access Control**: Role-based permissions
- **Network Security**: Encrypted communications
- **Audit Logging**: Comprehensive activity logs

### What about data privacy?

Privacy protections:
- **Data Encryption**: At rest and in transit
- **Access Controls**: Granular permissions
- **Audit Trails**: Complete activity tracking
- **Compliance**: GDPR, HIPAA, SOC2 support

### Can I deploy in air-gapped environments?

Yes, Backend.AI supports:
- **Offline Installation**: No internet dependency after setup
- **Private Registries**: Internal container repositories
- **Custom Images**: Build environments internally
- **Isolated Networks**: No external communication required

## Licensing and Commercial Use

### What is the licensing model?

Backend.AI uses:
- **Open Source**: LGPL license for core components
- **Enterprise Edition**: Commercial licensing available
- **Support Options**: Community and professional support
- **Custom Licensing**: Available for specific needs

### Can I use Backend.AI commercially?

Yes, commercial use is supported:
- **Open Source**: Free for most commercial uses
- **Enterprise Features**: Advanced capabilities available
- **Support Services**: Professional support and consulting
- **Custom Development**: Tailored solutions available

## Next Steps

### Getting Started
- [Installation Guide](../install/environments.md)
- [First Login](../get-started/first-login.md)
- [Creating Sessions](../get-started/first-session.md)

### Advanced Topics
- [Administration](../admin/users/registration.md)
- [API Reference](../api/manager/auth.md)
- [Troubleshooting](../troubleshooting/common.md)

### Community and Support
- GitHub Repository: Source code and issues
- Community Forum: User discussions
- Documentation: Comprehensive guides
- Enterprise Support: Professional services