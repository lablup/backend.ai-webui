# Understanding Storage

Learn how Backend.AI handles data storage, including persistent storage, virtual folders, and data management best practices.

## Storage Overview

Backend.AI provides flexible storage solutions to meet various data management needs:

- **Persistent Storage**: Data that survives session termination
- **Shared Storage**: Collaborate and share data across users
- **Temporary Storage**: Session-specific scratch space
- **External Storage**: Integration with cloud and network storage

## Virtual Folders (VFolders)

Virtual folders are the primary storage mechanism in Backend.AI, providing persistent, secure, and shareable storage containers.

### Key Features

- **Persistence**: Data survives session restarts and terminations
- **Isolation**: Secure separation between users and projects
- **Sharing**: Controlled sharing with team members
- **Versioning**: Track changes and maintain history
- **Quotas**: Manage storage usage per user or project

### Creating Virtual Folders

#### Through Web UI

1. **Navigate to Data Page**: Click "Data" in the sidebar
2. **Create New Folder**: Click "Create Folder" button
3. **Configure Folder**:
   - **Name**: Descriptive folder name
   - **Usage Mode**: General, Data, or Model serving
   - **Permission**: Private or shared access
   - **Quota**: Storage size limit

4. **Set Permissions**: Define who can access the folder

#### Using CLI

```bash
# Create a new virtual folder
backend.ai vfolder create my-data-folder

# Create with specific options
backend.ai vfolder create \
  --name "ml-experiments" \
  --quota "10GB" \
  --permission "rw"
```

### Folder Types and Usage Modes

#### General Purpose
- **Development**: Code repositories and development files
- **Documentation**: Project documentation and notes
- **Configuration**: Application and system configurations
- **Temporary**: Short-term file storage

#### Data Storage
- **Datasets**: Training and validation data
- **Preprocessing**: Intermediate data processing
- **Raw Data**: Original, unprocessed datasets
- **Archives**: Long-term data storage

#### Model Serving
- **Model Files**: Trained ML models
- **Artifacts**: Model metadata and configurations
- **Serving Assets**: Static files for model serving
- **Checkpoints**: Model training checkpoints

## Data Access and Management

### Mounting Folders in Sessions

Virtual folders must be mounted to be accessible in compute sessions:

#### Auto-mounting
Configure folders to automatically mount in new sessions:
1. Go to folder settings
2. Enable "Auto-mount"
3. Set mount path (e.g., `/home/work/data`)

#### Manual mounting
Mount folders when creating sessions:
1. In session creation dialog
2. Select "Mount Folders"
3. Choose folders to mount
4. Specify mount paths

### File Operations

#### Upload Files
Multiple ways to get data into virtual folders:
- **Web UI**: Drag and drop files
- **CLI**: Upload command
- **API**: Programmatic upload
- **Git**: Clone repositories directly

```bash
# Upload files via CLI
backend.ai vfolder upload my-folder local-file.txt

# Upload directory
backend.ai vfolder upload my-folder ./local-directory/
```

#### Download Files
Retrieve data from virtual folders:
- **Web UI**: Download individual files or folders
- **CLI**: Download command
- **Session Access**: Direct file system access in sessions

```bash
# Download files via CLI
backend.ai vfolder download my-folder remote-file.txt

# Download entire folder
backend.ai vfolder download my-folder ./
```

### Data Transfer Best Practices

#### Large File Handling
- **Compression**: Compress large datasets before upload
- **Chunking**: Split large files for reliable transfer
- **Resume**: Use tools that support transfer resumption
- **Parallel**: Use parallel transfer tools when available

#### Network Optimization
- **Bandwidth**: Consider network limitations
- **Timing**: Schedule large transfers during off-peak hours
- **Location**: Co-locate data with compute resources
- **Caching**: Use local caching for frequently accessed data

## Storage Backends

### Local Storage
- **Direct Attached**: Local disks on compute nodes
- **Network Attached**: NAS and SAN storage systems
- **Performance**: High-speed access for compute-intensive workloads
- **Backup**: Local backup and replication strategies

### Cloud Storage
- **Amazon S3**: AWS object storage integration
- **Google Cloud Storage**: GCP storage services
- **Azure Blob**: Microsoft Azure storage
- **MinIO**: Self-hosted S3-compatible storage

### Configuration Example
```toml
[volume]
default_host = "local"

[volume.local]
backend = "local"
path = "/var/lib/backend.ai/vfolders"

[volume.s3]
backend = "s3"
bucket = "my-backend-ai-storage"
region = "us-east-1"
access_key = "your-access-key"
secret_key = "your-secret-key"
```

## Sharing and Collaboration

### Permission Management

Control access to virtual folders:

#### Permission Levels
- **Read-only**: View and download files
- **Read-write**: Full file operations
- **Admin**: Manage permissions and settings

#### Sharing Methods
- **User-based**: Share with specific users
- **Group-based**: Share with user groups
- **Project-based**: Share within projects
- **Public**: Make publicly accessible (with caution)

### Collaborative Workflows

#### Team Development
```bash
# Share folder with team members
backend.ai vfolder invite my-project-folder user@example.com

# Set group permissions
backend.ai vfolder set-permission my-folder group:developers rw
```

#### Data Science Pipelines
1. **Raw Data**: Shared read-only data folder
2. **Processing**: Individual processing folders
3. **Results**: Shared results folder for collaboration
4. **Models**: Shared model repository

## Data Lifecycle Management

### Backup Strategies

#### Automated Backups
- **Regular Snapshots**: Scheduled folder snapshots
- **Version History**: Maintain multiple versions
- **External Backup**: Copy to external storage systems
- **Disaster Recovery**: Cross-region backup strategies

#### Manual Backup
```bash
# Export folder contents
backend.ai vfolder export my-folder backup-20240301.tar.gz

# Import folder contents
backend.ai vfolder import backup-folder backup-20240301.tar.gz
```

### Data Retention

#### Lifecycle Policies
- **Age-based**: Automatic deletion after time periods
- **Size-based**: Remove oldest data when quota exceeded
- **Access-based**: Delete unused data
- **Archive**: Move old data to cheaper storage

#### Cleanup Procedures
```bash
# List folder usage
backend.ai vfolder list --show-usage

# Remove unused folders
backend.ai vfolder delete old-experiment-folder

# Clean up temporary files
find /tmp -type f -atime +7 -delete
```

## Performance Optimization

### Storage Performance

#### I/O Optimization
- **SSD Storage**: Use solid-state drives for better performance
- **RAID Configuration**: Optimize for read/write patterns
- **Network Bandwidth**: Ensure adequate network capacity
- **Caching**: Implement caching layers for frequently accessed data

#### Access Patterns
- **Sequential Access**: Optimize for large file operations
- **Random Access**: Tune for small file operations
- **Concurrent Access**: Handle multiple simultaneous users
- **Read/Write Ratios**: Optimize based on usage patterns

### Monitoring and Alerting

#### Usage Monitoring
- **Quota Usage**: Track storage consumption
- **Access Patterns**: Monitor file access frequency
- **Performance Metrics**: I/O throughput and latency
- **Growth Trends**: Predict future storage needs

#### Alerts and Notifications
- **Quota Warnings**: Alert when approaching limits
- **Performance Degradation**: Monitor for slow I/O
- **Backup Failures**: Alert on backup issues
- **Security Events**: Monitor for unauthorized access

## Security Considerations

### Data Protection

#### Encryption
- **At Rest**: Encrypt stored data
- **In Transit**: Secure data transfers
- **Key Management**: Secure encryption key handling
- **Compliance**: Meet regulatory requirements

#### Access Control
- **Authentication**: Verify user identity
- **Authorization**: Control access permissions
- **Audit Logging**: Track all access events
- **Network Security**: Secure network communications

### Compliance and Auditing

#### Regulatory Compliance
- **GDPR**: European data protection regulations
- **HIPAA**: Healthcare data protection
- **SOX**: Financial data compliance
- **Industry Standards**: Sector-specific requirements

#### Audit Trails
```bash
# View folder access logs
backend.ai vfolder logs my-folder

# Export audit reports
backend.ai admin audit-export --start-date 2024-01-01
```

## Troubleshooting Storage Issues

### Common Problems

#### Mount Failures
- **Permissions**: Check folder and user permissions
- **Quotas**: Verify available storage space
- **Network**: Test network connectivity
- **Backend**: Check storage backend status

#### Performance Issues
- **Disk Space**: Monitor available storage
- **I/O Contention**: Check for concurrent access
- **Network Bandwidth**: Monitor transfer speeds
- **Hardware**: Verify storage hardware health

#### Data Corruption
- **Checksums**: Verify file integrity
- **Backups**: Restore from known good backups
- **Recovery Tools**: Use file system recovery utilities
- **Prevention**: Implement regular integrity checks

### Diagnostic Commands

```bash
# Check folder status
backend.ai vfolder info my-folder

# Test storage connectivity
backend.ai vfolder test-connection

# Monitor I/O performance
iostat -x 1

# Check disk usage
df -h /var/lib/backend.ai/vfolders
```

## Next Steps

Now that you understand storage:

1. **Create Your First Session**: [Learn session creation](first-session.md)
2. **Explore Applications**: [Try different environments](applications.md)
3. **Advanced Storage**: [Learn about advanced storage features](../usage/storage/vfolders.md)
4. **Administration**: [Storage configuration](../admin/config/storage.md)

For more advanced topics:
- [Data Transfer](../usage/storage/data-transfer.md)
- [Sharing and Permissions](../usage/storage/sharing.md)
- [Storage Configuration](../admin/config/storage.md)