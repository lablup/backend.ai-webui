const crypto = require('crypto');

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
// certificate is the only trust anchor and its fingerprint must match, so the
// handshake fails before any header (session cookie) is sent to another server.
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
    ca: pin.certificate,
    allowPartialTrustChain: true,
    checkServerIdentity: (_hostname, cert) =>
      fingerprintOf(cert.raw) === pin.fingerprint
        ? undefined
        : new Error(
            `The certificate of ${host} does not match the trusted one`,
          ),
  };
}

module.exports = { setTrustedCertificates, pinnedTlsOptions, fingerprintOf };
