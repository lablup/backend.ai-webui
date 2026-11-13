const crypto = require('crypto');
const tls = require('tls');

// host -> { fingerprint: 'sha256/<base64 of DER>', certificate: PEM }, as
// Backend.AI Desktop pins them after the user trusts a self-signed endpoint.
let pins = {};

function setTrustedCertificates(map) {
  pins = map && typeof map === 'object' && !Array.isArray(map) ? map : {};
}

function fingerprintOf(rawDer) {
  return (
    'sha256/' + crypto.createHash('sha256').update(rawDer).digest('base64')
  );
}

// TLS options for a WebSocket URL whose host the user pinned: the pinned
// certificate is trusted in addition to the default roots, so a server that later
// moves to a publicly valid certificate still passes the normal checks. The pin
// only bypasses the untrusted-authority and name-mismatch checks, the same error
// kinds the app's renderer may trust; an expired certificate still fails. Node TLS
// has no revocation check on this path, so a certificate the browser refuses as
// revoked would still pass here until the user resets it.
function pinnedTlsOptions(url) {
  let host;
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'wss:' && parsed.protocol !== 'https:') return {};
    host = parsed.host;
  } catch {
    return {};
  }
  const pin = pins[host];
  if (!pin || typeof pin.certificate !== 'string') return {};
  return {
    ca: [...tls.rootCertificates, pin.certificate],
    allowPartialTrustChain: true,
    checkServerIdentity: (hostname, cert) => {
      if (fingerprintOf(cert.raw) !== pin.fingerprint) {
        return tls.checkServerIdentity(hostname, cert);
      }
      // The stored pin bypasses the untrusted-authority and name-mismatch checks
      // only, not the validity window: an expired certificate still fails, as it
      // does in the app's renderer.
      const now = Date.now();
      if (
        Date.parse(cert.valid_from) > now ||
        Date.parse(cert.valid_to) < now
      ) {
        return new Error(`The certificate of ${hostname} has expired.`);
      }
      return undefined;
    },
  };
}

module.exports = { setTrustedCertificates, pinnedTlsOptions, fingerprintOf };
