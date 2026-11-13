import { X509Certificate } from 'node:crypto';
import { createRequire } from 'node:module';
import tls from 'node:tls';
import { afterEach, describe, expect, it } from 'vitest';

const require = createRequire(import.meta.url);
const {
  setTrustedCertificates,
  pinnedTlsOptions,
  fingerprintOf,
} = require('./trustedCertificates');

// Public halves of throwaway self-signed certificates (no keys). PEM_A is valid
// until 2036; PEM_EXPIRED lapsed on 2026-10-29, PEM_B on 2026-10-30.
const PEM_A = `-----BEGIN CERTIFICATE-----
MIIDCTCCAfGgAwIBAgIUEbtBTEgo/GfKagbFJF04NWWcelUwDQYJKoZIhvcNAQEL
BQAwFDESMBAGA1UEAwwJbG9jYWxob3N0MB4XDTI2MTExMzA4MjcyN1oXDTM2MTEx
MDA4MjcyN1owFDESMBAGA1UEAwwJbG9jYWxob3N0MIIBIjANBgkqhkiG9w0BAQEF
AAOCAQ8AMIIBCgKCAQEAkn4AmtoEEhz7U6lMpy34eC6YE3tJVAtwJBG7hP+AuCev
YTD9Iq5x3Mv/WJKakdl+VSk3cdTVqO8HQvk0YZMY7hUR8AAIfdoN/AYHyGN9crsf
XGJigPO5s9Gi7tTHjSVM7gF9xXxbee6mHVr8jxHtvsHNVzNVnVKP8u/MCgJu7Srw
0hTq4gTw8VrQukFq0n87NLdhSaQWjzIfTtz0zDVUM63R2UZIN4MTvXSb5sgpIVlM
prU9TyZIpn4f8I7kTN3286HIau7IoBI5TicnjZYrL0jTZa9F7YZP+LDtsigZja0B
QCjrnOuGgAzQvVAwLLbaoWovA0Q38qkibafPFxLTBwIDAQABo1MwUTAdBgNVHQ4E
FgQUcL13OeIgTIk6OKsqTveS+XgilEwwHwYDVR0jBBgwFoAUcL13OeIgTIk6OKsq
TveS+XgilEwwDwYDVR0TAQH/BAUwAwEB/zANBgkqhkiG9w0BAQsFAAOCAQEAQa5K
6oR5pSvLztzboVWBM6wmVQIdDfgN8QrJ2YxAyHcEEDzNiSdu5aji9pL6jrUTOJWY
uim4xbLhVIsPUthYvPEZFBZvGFjVENB7jt9cOkKY9i9JR0Oh9eRnq1TsvJh7g+LP
4oG41DBRrHlh6oY51T1WpAdyxfiGZXnt6sqXwPDrhsvZcb1mXOcQxtjk/ueIZx4C
nMlR3mkNU3ooc64ny5FPnKFUyoCLfNP4vQ/gygmzabIEk+hGbYIUIWdSOnSbW/49
0wAVfwSgLlUSgoTDxsuqzHjVpjGfcADbeZLH1pjRmNexakdzDy3wIrEAxzBYMfc/
8n4mHmWNd46wbArw4Q==
-----END CERTIFICATE-----`;
const PEM_EXPIRED = `-----BEGIN CERTIFICATE-----
MIIDCTCCAfGgAwIBAgIUZ/Lp+vo5tD0CzpjSEB1egkTQmcEwDQYJKoZIhvcNAQEL
BQAwFDESMBAGA1UEAwwJbG9jYWxob3N0MB4XDTI2MTAyODIxNDgwN1oXDTI2MTAy
OTIxNDgwN1owFDESMBAGA1UEAwwJbG9jYWxob3N0MIIBIjANBgkqhkiG9w0BAQEF
AAOCAQ8AMIIBCgKCAQEAlg46tOn+mkmVc2j3ujiLAsTTj/AbmIAYeNwf0Di/pw/t
gJBEZKXAJu2dHT9ioM1aObxRt/6ObP5vIJ68cAj54UZaTC0rBZwgwKdq7xtZotbS
OFpBzpnvilmnAfZShhggU2whlyy1RmJDMPHsgAg37Efl0emSnb3TSUyX6OxRnuVA
jdtBihQO1sTznTnQYF82Q4K0EcqhhtBSW3qP7hgmHu8EYsRr5SFKMSmdYzNcMa73
YBzJy50bJfNVoWgHbv4hf1Z+3G9x9mwxqPyIeQdAAbQvF4/Fy7IaVhKNfXqR5YTB
ZzAS5p0sNcrB2j+gUE+IWduZd1NyJCTD4mRHjsp+DwIDAQABo1MwUTAdBgNVHQ4E
FgQU5kL0xvoCQL+R5w+aARmwKNoyc2EwHwYDVR0jBBgwFoAU5kL0xvoCQL+R5w+a
ARmwKNoyc2EwDwYDVR0TAQH/BAUwAwEB/zANBgkqhkiG9w0BAQsFAAOCAQEAWN/h
ZxNIrhgQ0QoPf93x9GtKtkDQdIbx5TUst4RM13ujy1gCwqMdLV2lKZGPstQM+UhL
yQbl88ktWwfc1qvEA6wOTaPWEYqmEMyH8ZYonhGwyCrVm8AiJlEfWYCAm8DM5wt1
2koDgMUVlhoBl2DPUnsArk8Gy9WNx3BpuDY0tDPkOF91oMEX9J0zzS6fOZy+eMkM
soWqwTPnM4420TRx4wQN19EprS7cndN9fwJQHfuuFdTpLcm+5HQvNGSllqTYoEd6
Kze41EbT2LOb67rZ6aSedF3eqc+jLz+Nxk2k4igq1QcIIK3rBU9+wq30bZw+u46Y
XtSK1KeuALLY4RTFBA==
-----END CERTIFICATE-----`;
const PEM_B = `-----BEGIN CERTIFICATE-----
MIIDATCCAemgAwIBAgIUMsr3mqddZyg4zp1ozZ5lC4135WEwDQYJKoZIhvcNAQEL
BQAwEDEOMAwGA1UEAwwFb3RoZXIwHhcNMjYxMDI5MDMwMjM3WhcNMjYxMDMwMDMw
MjM3WjAQMQ4wDAYDVQQDDAVvdGhlcjCCASIwDQYJKoZIhvcNAQEBBQADggEPADCC
AQoCggEBALpYq9DH5L7IltVXhoDjOQ5qYqWyviu/aVGICIkCAXrCssQH4X+CCNLm
UnrEj8U6R9inpHXG0aY84PGCEDY4CoE6l3RnoXrbwZUaoVzLgbCOcPLypLO19umM
IeSNg4ksmTc1DDd22s1dEUvR55DnbiR18lPiNTePSUSHzUvEWtGAEYw1h3acdPbC
mZYLfAiJ3tJYIKmKh7cEDp4zUy1FdD1evUnUH62OGcX7dyqSuyvguGuBp04Nim7O
H08r9WXwct60JnWJg9vWmlmpvIKBjtaNPfRWErfJsaGJIgFrY0lPc5pv19CWMFcE
5D9Xoh9A9uJpi+Sx/cJvLXTV/9dZ9wECAwEAAaNTMFEwHQYDVR0OBBYEFNl72UlH
IJmZjMw54rDNl9UkG4VEMB8GA1UdIwQYMBaAFNl72UlHIJmZjMw54rDNl9UkG4VE
MA8GA1UdEwEB/wQFMAMBAf8wDQYJKoZIhvcNAQELBQADggEBAD0VdAVaFjWoCZz2
CsUJVLRDpT14fSM1duAfVdOj3gksnOhjDyAYSiIeD40ddqKA5m4Qs9Dd1ryXI9Wj
qxOfpc4/ZWA51X4KiuRN6b/ZChy+ORzXCYzQH3vy6oOT7anp0MPymJWybXbQ/GbW
Rx+qwmKGzQfJP+Hbs3Gn9EPfe+bqeiiF6u/oMT23Ji2VAys46u9Qo72HOHcXMZPP
m5nVLgFq8DILUNsCmyiG2a2gW/aOUdPcmlGWaxcPhnyz0brpdiVvTuQMqrxk9MT0
q+j4g7cVCHPKZkTszjvt5ded2Dr6FfBAA8UrgnYznCPbEmf0cqJt+60VwiZikUBj
1/nNB5c=
-----END CERTIFICATE-----`;
const rawOf = (pem: string) => new X509Certificate(pem).raw;
const pinA = { fingerprint: fingerprintOf(rawOf(PEM_A)), certificate: PEM_A };
// A peer certificate as Node TLS hands it to checkServerIdentity: raw + validity.
const peerOf = (pem: string) => {
  const x = new X509Certificate(pem);
  return { raw: x.raw, valid_from: x.validFrom, valid_to: x.validTo };
};

describe('wsproxy trusted certificate pinning', () => {
  afterEach(() => setTrustedCertificates({}));

  it('uses the same fingerprint format as Electron (sha256/<base64 DER>)', () => {
    expect(pinA.fingerprint).toMatch(/^sha256\/[A-Za-z0-9+/]{43}=$/);
  });

  it('adds nothing for an unpinned host or a non-TLS URL', () => {
    setTrustedCertificates({ 'bai.local:8090': pinA });
    expect(pinnedTlsOptions('wss://other.local:8090/x')).toEqual({});
    expect(pinnedTlsOptions('ws://bai.local:8090/x')).toEqual({});
    expect(pinnedTlsOptions('not a url')).toEqual({});
  });

  it('trusts the pinned certificate on top of the default roots', () => {
    setTrustedCertificates({ 'bai.local:8090': pinA });
    const options = pinnedTlsOptions('wss://bai.local:8090/stream');
    expect(options.ca).toEqual([...tls.rootCertificates, PEM_A]);
    expect(options.allowPartialTrustChain).toBe(true);
    // The pinned certificate is accepted even though its name does not match.
    expect(
      options.checkServerIdentity('bai.local', peerOf(PEM_A)),
    ).toBeUndefined();
  });

  it('holds any other certificate to the normal hostname check', () => {
    setTrustedCertificates({ 'bai.local:8090': pinA });
    const { checkServerIdentity } = pinnedTlsOptions('wss://bai.local:8090/');
    const other = (name: string) => ({
      raw: rawOf(PEM_B),
      subject: { CN: name },
      subjectaltname: `DNS:${name}`,
    });
    // e.g. the server moved to a publicly valid certificate for its own name
    expect(
      checkServerIdentity('bai.local', other('bai.local')),
    ).toBeUndefined();
    expect(
      checkServerIdentity('bai.local', other('evil.example')),
    ).toBeInstanceOf(Error);
  });

  it('refuses an expired certificate even when its fingerprint is pinned', () => {
    setTrustedCertificates({
      'bai.local:8090': {
        fingerprint: fingerprintOf(rawOf(PEM_EXPIRED)),
        certificate: PEM_EXPIRED,
      },
    });
    const { checkServerIdentity } = pinnedTlsOptions('wss://bai.local:8090/');
    expect(
      checkServerIdentity('bai.local', peerOf(PEM_EXPIRED)),
    ).toBeInstanceOf(Error);
  });

  it('ignores a malformed list', () => {
    setTrustedCertificates(null);
    expect(pinnedTlsOptions('wss://bai.local:8090/')).toEqual({});
    setTrustedCertificates({ 'bai.local:8090': { fingerprint: 'sha256/x' } });
    expect(pinnedTlsOptions('wss://bai.local:8090/')).toEqual({});
  });
});
