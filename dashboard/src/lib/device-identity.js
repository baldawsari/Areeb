import { ed25519 } from '@noble/curves/ed25519.js';
import { sha256 } from '@noble/hashes/sha2.js';
import { bytesToHex } from '@noble/curves/utils.js';

const STORAGE_KEY = 'areeb-device-identity';

// base64url encode/decode (no padding)
function toBase64Url(bytes) {
  const bin = String.fromCharCode(...bytes);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(str) {
  const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  const pad = (4 - (base64.length % 4)) % 4;
  const bin = atob(base64 + '='.repeat(pad));
  return new Uint8Array([...bin].map((c) => c.charCodeAt(0)));
}

/**
 * Generate a new Ed25519 identity.
 * Returns { privateKey (hex), publicKey (hex), deviceId (sha256 hex), publicKeyBase64Url }
 */
function generateIdentity() {
  const privateKey = ed25519.utils.randomPrivateKey();
  const publicKey = ed25519.getPublicKey(privateKey);
  const deviceId = bytesToHex(sha256(publicKey));
  return {
    privateKeyHex: bytesToHex(privateKey),
    publicKeyHex: bytesToHex(publicKey),
    publicKeyBase64Url: toBase64Url(publicKey),
    deviceId,
    createdAtMs: Date.now(),
  };
}

/**
 * Load existing identity from localStorage, or create and persist a new one.
 */
export function getOrCreateIdentity() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const stored = JSON.parse(raw);
      if (stored.version === 1 && stored.privateKeyHex && stored.publicKeyHex && stored.deviceId) {
        return {
          privateKeyHex: stored.privateKeyHex,
          publicKeyHex: stored.publicKeyHex,
          publicKeyBase64Url: stored.publicKeyBase64Url || toBase64Url(fromHex(stored.publicKeyHex)),
          deviceId: stored.deviceId,
        };
      }
    }
  } catch {}

  const identity = generateIdentity();
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ version: 1, ...identity })
    );
  } catch {}
  return identity;
}

function fromHex(hex) {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
  }
  return bytes;
}

/**
 * Build the v2 device auth payload string.
 */
export function buildPayload({ deviceId, clientId, clientMode, role, scopes, signedAtMs, token, nonce }) {
  return [
    'v2',
    deviceId,
    clientId,
    clientMode,
    role,
    scopes.join(','),
    String(signedAtMs),
    token ?? '',
    nonce,
  ].join('|');
}

/**
 * Sign a payload with the Ed25519 private key.
 * Returns base64url-encoded signature.
 */
export function signPayload(privateKeyHex, payload) {
  const privBytes = fromHex(privateKeyHex);
  const msgBytes = new TextEncoder().encode(payload);
  const sig = ed25519.sign(msgBytes, privBytes);
  return toBase64Url(sig);
}
