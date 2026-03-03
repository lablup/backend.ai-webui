# Creating Your First Session

Learn how to create and manage compute sessions in Backend.AI for your development and research needs.

## Understanding Sessions

A **compute session** is an isolated container environment where you can run code, perform computations, and access various tools and frameworks.

### Session Types

- **Interactive Sessions**: Real-time development with Jupyter notebooks, terminals, and IDEs
- **Batch Sessions**: Automated script execution for long-running tasks
- **Inference Sessions**: Model serving endpoints for AI applications

## Creating an Interactive Session

### Step 1: Navigate to Sessions

1. Log into Backend.AI Web UI
2. Click **Sessions** in the left sidebar
3. Click the **Start Session** button

### Step 2: Configure Session Settings

#### Basic Configuration
- **Session Name**: Enter a descriptive name
- **Environment**: Select a compute environment (e.g., Python, TensorFlow, PyTorch)
- **Version**: Choose the framework version

#### Resource Allocation
- **CPU Cores**: Number of CPU cores (e.g., 2-8 cores)
- **Memory**: RAM allocation (e.g., 4GB-32GB)
- **GPU**: Graphics processing units (if available)
- **Shared Memory**: Additional shared memory for parallel processing

#### Storage Options
- **Auto-mount Folders**: Select folders to automatically mount
- **Working Directory**: Set the default working directory
- **Temporary Storage**: Additional scratch space

### Step 3: Launch the Session

1. Review your configuration
2. Click **Launch Session**
3. Wait for the session to start (usually 30-60 seconds)
4. Access your session through the provided interface

## Working with Your Session

### Jupyter Notebook Interface

Most Python environments include Jupyter:
1. Click **Jupyter Notebook** from the session card
2. Create new notebooks or open existing ones
3. Run code cells interactively
4. Save your work to mounted storage folders

### Terminal Access

For command-line operations:
1. Click **Terminal** from the session card
2. Access the full Linux environment
3. Install additional packages with pip/conda
4. Run scripts and command-line tools

### File Management

Managing files in your session:
- **Upload Files**: Drag and drop files into the interface
- **Download Results**: Save outputs to your local machine
- **Folder Navigation**: Browse mounted storage folders
- **Version Control**: Use git for code management

## Example: Python Data Science Session

### Creating a Basic Analysis Session

1. **Select Environment**: Python 3.9 with scientific libraries
2. **Allocate Resources**: 4 CPU cores, 8GB RAM
3. **Mount Storage**: Attach your data folder
4. **Launch Session**

### Sample Python Code

```python
import pandas as pd
import matplotlib.pyplot as plt
import numpy as np

# Load data from mounted storage
data = pd.read_csv('/home/work/data/sample.csv')

# Perform basic analysis
print(data.describe())

# Create visualization
plt.figure(figsize=(10, 6))
plt.plot(data['timestamp'], data['value'])
plt.title('Time Series Analysis')
plt.xlabel('Time')
plt.ylabel('Value')
plt.savefig('/home/work/output/analysis.png')
plt.show()
```

## Session Management

### Monitoring Sessions

Track your running sessions:
- **Resource Usage**: CPU, memory, and GPU utilization
- **Runtime**: Session duration and costs
- **Status**: Running, idle, or error states
- **Logs**: Access session logs for debugging

### Session Operations

Manage your sessions effectively:
- **Pause/Resume**: Temporarily stop sessions to save resources
- **Restart**: Restart sessions that encounter errors
- **Clone**: Duplicate sessions with the same configuration
- **Terminate**: Stop sessions when work is complete

### Saving Your Work

Ensure your work is preserved:
- **Save to Storage Folders**: Use mounted persistent storage
- **Download Files**: Save important files locally
- **Export Notebooks**: Download Jupyter notebooks
- **Version Control**: Commit code to git repositories

## Best Practices

### Resource Efficiency
- **Right-size Resources**: Allocate appropriate CPU/memory for your workload
- **Monitor Usage**: Check resource utilization regularly
- **Clean Up**: Terminate unused sessions promptly
- **Schedule Long Jobs**: Use batch sessions for extended computations

### Data Management
- **Use Storage Folders**: Store data in persistent storage
- **Organize Files**: Maintain clear directory structures
- **Backup Important Work**: Keep copies of critical files
- **Share Responsibly**: Use appropriate permissions for shared data

### Security Considerations
- **Protect Sensitive Data**: Avoid storing credentials in code
- **Use Environment Variables**: Store secrets securely
- **Regular Updates**: Keep environments updated
- **Access Control**: Review and audit session permissions

## Troubleshooting

### Common Session Issues

**Session Won't Start**:
- Check resource availability
- Verify environment image exists
- Review error logs

**Performance Problems**:
- Monitor resource utilization
- Check for memory leaks
- Optimize code efficiency

**File Access Issues**:
- Verify storage folder permissions
- Check mount paths
- Ensure sufficient storage space

## Next Steps

Now that you've created your first session:

1. **Explore Applications**: Try [different environments](applications.md)
2. **Understand Storage**: Learn about [data management](storage.md)
3. **Advanced Features**: Explore [model serving](model-serving.md)
4. **CLI Operations**: Use the [command line interface](../usage/cli/installation.md)

For more advanced session management:
- [Batch Sessions](../usage/sessions/batch.md)
- [Cluster Computing](../usage/sessions/cluster.md)
- [Resource Optimization](../usage/workload/optimization.md)