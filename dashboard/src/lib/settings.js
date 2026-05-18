/**
 * Gateway connection settings.
 *
 * Resolution order: localStorage → Vite env vars → built-in defaults.
 */

const URL_KEY = 'areeb-gateway-url';
const TOKEN_KEY = 'areeb-gateway-token';

const DEFAULT_URL = import.meta.env.VITE_GATEWAY_URL || 'ws://localhost:18789';
const DEFAULT_TOKEN = import.meta.env.VITE_GATEWAY_TOKEN || '';

export function getGatewaySettings() {
  let url = DEFAULT_URL;
  let token = DEFAULT_TOKEN;
  try {
    const storedUrl = localStorage.getItem(URL_KEY);
    const storedToken = localStorage.getItem(TOKEN_KEY);
    if (storedUrl !== null) url = storedUrl;
    if (storedToken !== null) token = storedToken;
  } catch {}
  return { url, token };
}
