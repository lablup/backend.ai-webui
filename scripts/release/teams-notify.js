#!/usr/bin/env node

const https = require('https');

/**
 * Send notification to Microsoft Teams channel
 * @param {object} options - Notification options
 * @returns {Promise} - Promise that resolves when notification is sent
 */
async function sendTeamsNotification({
  webhookUrl,
  version,
  tag,
  releaseUrl,
  isPrerelease = false,
  isSuccess = true,
  error = null
}) {
  const payload = createTeamsPayload({
    version,
    tag,
    releaseUrl,
    isPrerelease,
    isSuccess,
    error
  });

  return new Promise((resolve, reject) => {
    const data = JSON.stringify(payload);
    const url = new URL(webhookUrl);

    const options = {
      hostname: url.hostname,
      port: 443,
      path: url.pathname + url.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          console.log('✅ Teams notification sent successfully');
          resolve(responseData);
        } else {
          console.error(`❌ Teams notification failed: ${res.statusCode}`);
          reject(new Error(`HTTP ${res.statusCode}: ${responseData}`));
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ Teams notification error:', error.message);
      reject(error);
    });

    req.write(data);
    req.end();
  });
}

/**
 * Create Teams message payload
 * @param {object} options - Message options
 * @returns {object} - Teams message payload
 */
function createTeamsPayload({
  version,
  tag,
  releaseUrl,
  isPrerelease = false,
  isSuccess = true,
  error = null
}) {
  const basePayload = {
    "@type": "MessageCard",
    "@context": "http://schema.org/extensions",
    "themeColor": isSuccess ? "0076D7" : "FF0000",
    "summary": `Backend.AI WebUI Release ${version}`,
    "sections": [
      {
        "activityTitle": `Backend.AI WebUI Release ${version}`,
        "activitySubtitle": `Release ${isSuccess ? 'completed' : 'failed'}`,
        "activityImage": "https://github.com/lablup/backend.ai-webui/raw/main/manifest/icon-512.png",
        "facts": [
          {
            "name": "Version",
            "value": version
          },
          {
            "name": "Tag",
            "value": tag
          },
          {
            "name": "Type",
            "value": isPrerelease ? "Pre-release" : "Stable Release"
          },
          {
            "name": "Status",
            "value": isSuccess ? "✅ Success" : "❌ Failed"
          }
        ],
        "markdown": true
      }
    ]
  };

  if (isSuccess) {
    // Add success-specific content
    basePayload.sections[0].text = `🚀 Release ${version} has been successfully created and published!`;
    
    if (releaseUrl) {
      basePayload.potentialAction = [
        {
          "@type": "OpenUri",
          "name": "View Release",
          "targets": [
            {
              "os": "default",
              "uri": releaseUrl
            }
          ]
        },
        {
          "@type": "OpenUri",
          "name": "Download Assets",
          "targets": [
            {
              "os": "default",
              "uri": `${releaseUrl}#assets`
            }
          ]
        }
      ];
    }

    // Add release notes section if it's a stable release
    if (!isPrerelease) {
      basePayload.sections.push({
        "activityTitle": "📦 What's Next",
        "text": "Desktop applications are being built and will be available shortly. Check the release page for download links.",
        "markdown": true
      });
    }
  } else {
    // Add failure-specific content
    basePayload.sections[0].text = `❌ Release ${version} failed to complete.`;
    
    if (error) {
      basePayload.sections[0].facts.push({
        "name": "Error",
        "value": error
      });
    }

    basePayload.potentialAction = [
      {
        "@type": "OpenUri",
        "name": "View Workflow",
        "targets": [
          {
            "os": "default",
            "uri": "https://github.com/lablup/backend.ai-webui/actions"
          }
        ]
      }
    ];
  }

  return basePayload;
}

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length < 3) {
    console.log('Usage: node teams-notify.js <webhookUrl> <version> <tag> [releaseUrl] [isPrerelease] [isSuccess] [error]');
    console.log('  webhookUrl: Teams webhook URL');
    console.log('  version: Release version (e.g., "25.15.0")');
    console.log('  tag: Release tag (e.g., "v25.15.0")');
    console.log('  releaseUrl: GitHub release URL (optional)');
    console.log('  isPrerelease: "true" or "false" (optional, default: false)');
    console.log('  isSuccess: "true" or "false" (optional, default: true)');
    console.log('  error: Error message (optional)');
    process.exit(1);
  }

  const [
    webhookUrl,
    version,
    tag,
    releaseUrl = null,
    isPrerelease = 'false',
    isSuccess = 'true',
    error = null
  ] = args;

  sendTeamsNotification({
    webhookUrl,
    version,
    tag,
    releaseUrl,
    isPrerelease: isPrerelease === 'true',
    isSuccess: isSuccess === 'true',
    error
  }).then(() => {
    console.log('Teams notification completed');
    process.exit(0);
  }).catch((err) => {
    console.error('Teams notification failed:', err.message);
    process.exit(1);
  });
}

module.exports = {
  sendTeamsNotification,
  createTeamsPayload
};