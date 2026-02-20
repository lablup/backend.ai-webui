/**
 * Shared sample markdown content for style catalogs.
 * Covers every supported markdown element (including extended syntax)
 * so you can preview all styles at a glance.
 *
 * Used by both the web HTML preview and the PDF preview pipelines.
 * Each pipeline processes this markdown through its own renderer,
 * ensuring the catalog accurately reflects how markdown renders in each output.
 */

/**
 * Returns raw markdown strings that will be processed through
 * the markdown pipeline (admonitions, code block meta, etc.).
 */
export function getCatalogMarkdown(): Array<{
  title: string;
  markdown: string;
}> {
  return [
    {
      title: "Typography",
      markdown: `
# Typography

## Heading Level 2

### Heading Level 3

#### Heading Level 4

##### Heading Level 5

###### Heading Level 6

---

## Paragraphs & Inline Styles

This is a standard paragraph with **bold text**, *italic text*, ***bold italic***, and ~~strikethrough~~. You can also use \`inline code\` for technical terms like \`config.toml\` or \`apiEndpoint\`.

Here is a second paragraph to demonstrate spacing between blocks. The line-height is set to 1.65 following Infima defaults. Long paragraphs should wrap naturally and maintain comfortable readability with appropriate leading.

## Links

- External link: [Backend.AI Documentation](https://docs.backend.ai)
- Internal anchor link: [Jump to Admonitions](#style-catalog-admonitions)
- Auto-linked URL: https://example.com

## Horizontal Rule

Content above the rule.

---

Content below the rule.
`,
    },
    {
      title: "Lists",
      markdown: `
# Lists

## Unordered List

- First item
- Second item with **bold** and \`code\`
- Third item with nested list:
  - Nested item A
  - Nested item B
    - Deeply nested item
  - Nested item C
- Fourth item

## Ordered List

1. Navigate to the **Sessions** page from the sidebar.
2. Click the **+ New Session** button.
3. Configure the session:
   - **Session Name**: Enter a descriptive name.
   - **Resource Group**: Select the target resource group.
   - **Image**: Choose the container image (e.g., \`cr.backend.ai/stable/python\`).
4. Set resource allocation:
   1. CPU cores
   2. Memory (GB)
   3. GPU (fractional)
5. Click **Launch** to start the session.

## Task List (Checkbox)

- [x] Install Backend.AI WebUI
- [x] Configure \`config.toml\`
- [ ] Set up SSL certificates
- [ ] Configure resource groups
- [ ] Create user accounts
`,
    },
    {
      title: "Admonitions",
      markdown: `
# Admonitions

Callout blocks for highlighting important information.

## Note

:::note
This is a **note** admonition. Use it to highlight general information that users should take into account, even when skimming.
:::

## Tip

:::tip
This is a **tip** admonition. Use it to provide helpful suggestions and best practices.

- Tips can contain **lists** and other markdown
- Use them to share shortcuts or recommendations
:::

## Info

:::info
This is an **info** admonition. Use it for supplementary information that adds context.

You can include \`inline code\`, [links](#admonitions), and other formatting inside admonitions.
:::

## Warning

:::warning
This is a **warning** admonition. Use it to alert users about potential issues or pitfalls.

Sessions that exceed their allocated memory will be **terminated automatically**. Always request sufficient resources.
:::

## Caution

:::caution
This is a **caution** admonition. Similar to warning but for situations requiring extra care.

Modifying system-level settings may affect all users in the domain.
:::

## Danger

:::danger
This is a **danger** admonition. Use it for critical warnings about destructive or irreversible actions.

Deleting a storage folder is **irreversible**. All data in the folder will be permanently lost.
:::

## Custom Titles

:::note[Important Configuration Note]
Admonitions can have custom titles using the bracket syntax \`:::type[Custom Title]\`.

Make sure to configure \`apiEndpoint\` in \`config.toml\` before connecting.
:::

:::tip[Performance Tip]
Enable fractional GPU (fGPU) to share GPU resources across multiple sessions efficiently.
:::

:::danger[Data Loss Warning]
**Never** delete a virtual folder without backing up its contents first. Once deleted, the data **cannot be recovered**.
:::

## Admonition with Rich Content

:::info[Resource Allocation Guide]
When creating a new session, consider the following resource settings:

| Resource | Minimum | Recommended | Maximum |
|----------|---------|-------------|---------|
| CPU      | 1 core  | 4 cores     | 8 cores |
| Memory   | 1 GB    | 8 GB        | 64 GB   |
| GPU      | 0       | 0.5 fGPU    | 4 fGPU  |

Use the following configuration to set defaults:

\`\`\`toml title="config.toml"
[resources]
maxCPU = 8
maxMemory = "64g"
maxGPU = 4.0
\`\`\`
:::
`,
    },
    {
      title: "Code Blocks",
      markdown: `
# Code Blocks

## Inline Code

Use \`config.toml\` to configure the \`apiEndpoint\` setting. The default image is \`cr.backend.ai/stable/python\`.

## Basic Code Block

\`\`\`toml
[general]
apiEndpoint = "https://api.backend.ai" asdflkjaslkdfjlsakdfjlksadjflkasjdfkls asdlkfj asljdflkasj dflkjsadflk jsa sakldjf laskjdfl ksdjflkjas dlfkjaskljf alskjf lskadjflkas jflkasjflksadjlfkj
apiEndpointText = "Backend.AI Cloud"
defaultSessionEnvironment = "cr.backend.ai/stable/python"  
siteDescription = "Backend.AI WebUI"

[resources]
maxCPU = 8
maxMemory = "16g"
maxGPU = 1.0
\`\`\`

## Code Block with Title

\`\`\`python title="train.py"
import torch
import torch.nn as nn

model = nn.Sequential(
    nn.Linear(784, 256),
    nn.ReLU(),
    nn.Dropout(0.2),
    nn.Linear(256, 10),
)

optimizer = torch.optim.Adam(model.parameters(), lr=0.001)
\`\`\`

\`\`\`bash title="Terminal"
$ pip install backend.ai-client
$ backend.ai session create --name my-session python:3.11
$ backend.ai session list
\`\`\`

## Code Block with Line Highlighting

\`\`\`javascript title="config.js" {2,4-6}
const config = {
  apiEndpoint: 'https://api.backend.ai',  // highlighted
  version: '26.2.0',
  features: {                              // highlighted
    gpu: true,                             // highlighted
    multiNode: true,                       // highlighted
  },
};
\`\`\`

\`\`\`yaml title="docker-compose.yml" {3,5}
services:
  backend:
    image: cr.backend.ai/stable/python     # highlighted
    resources:
      gpu: 1.0                             # highlighted
    memory: 16g
\`\`\`

## Line Highlighting Without Title

\`\`\`python {1,3-4}
import torch
import numpy as np
from backend.ai import Client  # highlighted
client = Client()               # highlighted
\`\`\`

## Multiple Languages

\`\`\`json title="package.json"
{
  "name": "backend.ai-webui",
  "version": "26.2.0",
  "scripts": {
    "dev": "vite",
    "build": "rollup -c"
  }
}
\`\`\`

\`\`\`sql title="query.sql"
SELECT u.email, u.username, COUNT(s.id) AS session_count
FROM users u
LEFT JOIN sessions s ON u.id = s.user_id
WHERE u.is_active = true
GROUP BY u.id
ORDER BY session_count DESC
LIMIT 10;
\`\`\`

\`\`\`css title="theme.css"
:root {
  --primary: #3578e5;
  --success: #00a400;
  --warning: #ffba00;
  --danger: #fa383e;
}
\`\`\`
`,
    },
    {
      title: "Tables",
      markdown: `
# Tables

## Basic Table

| Feature | Description | Default |
|---------|-------------|---------|
| \`apiEndpoint\` | The API server endpoint URL | \`https://api.backend.ai\` |
| \`defaultSessionEnvironment\` | Default container image | \`cr.backend.ai/stable/python\` |
| \`siteDescription\` | Display name in browser tab | \`Backend.AI WebUI\` |
| \`allowSignup\` | Enable self-service signup | \`false\` |

## Feature Comparison Table

| Feature | Community | Enterprise |
|---------|:---------:|:----------:|
| Session Management | Yes | Yes |
| GPU Sharing (fGPU) | Limited | Full |
| Multi-node Clusters | No | Yes |
| SSO Integration | No | Yes |
| Priority Scheduling | No | Yes |
| SLA Support | No | Yes |
| Custom Images | Yes | Yes |
| Storage Quotas | Basic | Advanced |

## System Requirements

| Component | Minimum | Recommended | Notes |
|-----------|---------|-------------|-------|
| Browser | Chrome 90+ | Latest Chrome/Firefox | Safari 14+ also supported |
| Network | Stable connection | Low-latency | Required for API communication |
| Resolution | 1280 x 800 | 1920 x 1080 | Responsive layout |
| RAM | 2 GB | 4 GB | For browser tab |
`,
    },
    {
      title: "Blockquotes",
      markdown: `
# Blockquotes

## Simple Blockquote

> Your administrator must configure the \`apiEndpoint\` in \`config.toml\` before you can connect to the Backend.AI server.

## Multi-line Blockquote

> Backend.AI is an open-source platform for managing AI/ML computing resources.
> It provides GPU virtualization, container orchestration, and multi-tenant resource management.
>
> Users can create compute sessions, manage storage folders, and monitor resource usage through the WebUI.

## Nested Blockquote

> This is the outer blockquote.
>
> > This is a nested blockquote with additional context.
>
> Back to the outer level.

## Blockquote with Formatting

> **Important**: The following configuration keys are required:
>
> - \`apiEndpoint\` — API server URL
> - \`apiEndpointText\` — Display name for the endpoint
> - \`defaultSessionEnvironment\` — Default container image
>
> See the [Installation Guide](#tables) for details.
`,
    },
    {
      title: "Details & Summary",
      markdown: `
# Details / Summary

Collapsible content sections using HTML \`<details>\` and \`<summary>\` elements.

<details>
<summary>Click to expand: Basic Example</summary>

This is the hidden content that appears when the user clicks the summary.

It supports **bold**, *italic*, \`code\`, and other markdown formatting.

</details>

<details>
<summary>Advanced Configuration Options</summary>

You can configure Backend.AI WebUI using \`config.toml\`:

\`\`\`toml title="config.toml"
[general]
apiEndpoint = "https://api.backend.ai"
allowSignup = false
allowAnonymousChangePassword = false

[resources]
maxCPU = 8
maxMemory = "16g"
maxGPU = 1.0

[pipeline]
frontendEndpoint = "/pipeline"
\`\`\`

These settings control server connection and resource limits.

</details>

<details>
<summary>Troubleshooting: Common Connection Issues</summary>

If you cannot connect to the Backend.AI server:

1. Check that \`apiEndpoint\` is correctly configured
2. Verify network connectivity to the API server
3. Ensure your credentials are valid
4. Check the browser console for error messages

:::warning
If you see a CORS error, contact your administrator to configure the API server's allowed origins.
:::

</details>

<details>
<summary>FAQ: Resource Allocation</summary>

**Q: How do I request more GPU resources?**

Contact your project administrator to increase the resource policy limits for your keypair.

**Q: What happens if my session exceeds memory limits?**

The session will be terminated automatically. Use the monitoring panel to track resource usage in real-time.

| Resource | Soft Limit | Hard Limit | Action |
|----------|-----------|------------|--------|
| CPU | 90% | 100% | Throttled |
| Memory | 90% | 100% | Terminated |
| GPU Memory | 95% | 100% | OOM Error |

</details>
`,
    },
    {
      title: "Images & Media",
      markdown: `
# Images & Media

## Image Styling

Images use the \`.doc-image\` class with a subtle border, rounded corners, and centered layout.

Since this is a style catalog without actual image files, here's how an image tag renders:

![Session list page showing active compute sessions](images/placeholder.png)

The image above would display with:
- \`max-width: 100%\` for responsive sizing
- Subtle border and shadow
- Centered with auto margins
- Rounded corners matching the Infima border-radius

## Image Syntax Reference

\`\`\`markdown
![Alt text describing the image](images/filename.png)
\`\`\`
`,
    },
    {
      title: "Mixed Content",
      markdown: `
# Mixed Content Showcase

Real-world documentation often combines multiple elements. Here are realistic examples.

## Session Creation Workflow

:::info[Before You Begin]
Make sure you have a valid Backend.AI account and the correct \`apiEndpoint\` configured.
:::

To create a new compute session:

1. Navigate to **Sessions** in the sidebar
2. Click **+ New Session**
3. Fill in the session configuration:
   - **Session Name**: A descriptive name (e.g., \`training-bert-v2\`)
   - **Resource Group**: Select your assigned resource group
   - **Image**: Choose from available images:

| Image | Description | GPU Support |
|-------|-------------|:-----------:|
| \`python:3.11\` | Standard Python | Yes |
| \`pytorch:2.0\` | PyTorch framework | Yes |
| \`tensorflow:2.14\` | TensorFlow framework | Yes |
| \`r-base:4.3\` | R Language | Limited |

4. Set resource allocation:

\`\`\`toml title="Example resource config"
cpu = 4
memory = "8g"
gpu = 0.5
\`\`\`

5. Click **Launch**

:::warning
If the resource group has insufficient capacity, the session will be queued. Check the **Dashboard** for current resource utilization.
:::

<details>
<summary>Advanced: Environment Variables</summary>

You can pass custom environment variables to your session:

\`\`\`bash title="Terminal"
$ export CUDA_VISIBLE_DEVICES=0,1
$ export NCCL_DEBUG=INFO
\`\`\`

These will be available inside the container at runtime.

:::tip
Use the session's **Terminal** app to verify environment variables with \`env | grep CUDA\`.
:::

</details>

## Error Reference

:::danger[Critical Error: Out of Memory]
**Symptom**: Session terminates unexpectedly with exit code 137.

**Cause**: The session exceeded its allocated memory limit.

**Resolution**:
1. Recreate the session with more memory
2. Optimize your code to use less memory
3. Use memory profiling tools: \`memory_profiler\` (Python) or \`valgrind\` (C/C++)

\`\`\`python title="memory_check.py" {3-4}
import psutil
process = psutil.Process()
memory_info = process.memory_info()    # highlighted
print(f"RSS: {memory_info.rss / 1e9:.2f} GB")  # highlighted
\`\`\`
:::
`,
    },
  ];
}
