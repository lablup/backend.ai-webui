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
// moves to a publicly valid certificate still passes the normal checks. Anything
// else fails the handshake before a header (session cookie) is sent.
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
    checkServerIdentity: (hostname, cert) =>
      fingerprintOf(cert.raw) === pin.fingerprint
        ? undefined
        : tls.checkServerIdentity(hostname, cert),
  };
}

module.exports = { setTrustedCertificates, pinnedTlsOptions, fingerprintOf };
