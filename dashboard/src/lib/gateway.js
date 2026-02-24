const DEFAULT_URL = import.meta.env.VITE_GATEWAY_URL || 'ws://localhost:18789';
const DEFAULT_TOKEN = import.meta.env.VITE_GATEWAY_TOKEN || '';

const PROTOCOL_VERSION = 3;

class OpenClawGateway {
  constructor() {
    this.ws = null;
    this.reqId = 0;
    this.pending = new Map();
    this.listeners = new Map();
    this.status = 'disconnected';
    this._onStatusChange = null;
    this._reconnectTimer = null;
    this._reconnectDelay = 1000;
    this._url = null;
    this._token = null;
    this.snapshot = null;
    this.serverInfo = null;
  }

  onStatusChange(fn) {
    this._onStatusChange = fn;
  }

  _setStatus(s) {
    this.status = s;
    this._onStatusChange?.(s);
  }

  connect(url, token) {
    if (this.ws) this.disconnect();

    this._url = url || DEFAULT_URL;
    this._token = token || DEFAULT_TOKEN;
    this._setStatus('connecting');

    try {
      this.ws = new WebSocket(this._url);
    } catch (err) {
      console.error('[gateway] WebSocket creation failed:', err);
      this._setStatus('error');
      this._scheduleReconnect();
      return;
    }

    this.ws.onopen = () => {
      console.log('[gateway] WebSocket opened, waiting for challenge...');
    };

    this.ws.onmessage = (e) => {
      try {
        this._handleFrame(JSON.parse(e.data));
      } catch (err) {
        console.error('[gateway] Frame parse error:', err);
      }
    };

    this.ws.onerror = () => this._setStatus('error');

    this.ws.onclose = (e) => {
      console.log('[gateway] Closed:', e.code, e.reason);
      this._setStatus('disconnected');
      this.ws = null;
      this._scheduleReconnect();
    };
  }

  disconnect() {
    clearTimeout(this._reconnectTimer);
    this._reconnectTimer = null;
    if (this.ws) {
      this.ws.onclose = null;
      this.ws.close();
      this.ws = null;
    }
    this._setStatus('disconnected');
    this.snapshot = null;
    this.serverInfo = null;
    for (const [, { reject }] of this.pending) reject(new Error('disconnected'));
    this.pending.clear();
  }

  _scheduleReconnect() {
    if (this._reconnectTimer) return;
    this._reconnectTimer = setTimeout(() => {
      this._reconnectTimer = null;
      if (this.status !== 'connected' && this._url) {
        this.connect(this._url, this._token);
      }
    }, this._reconnectDelay);
    this._reconnectDelay = Math.min(this._reconnectDelay * 1.5, 30000);
  }

  _handleFrame(frame) {
    if (frame.type === 'event') {
      this._handleEvent(frame);
    } else if (frame.type === 'res') {
      // Response IDs may come back as string or number — normalize to string
      const h = this.pending.get(String(frame.id));
      if (h) {
        this.pending.delete(String(frame.id));
        if (frame.ok) {
          h.resolve(frame.payload);
        } else {
          console.warn('[gateway] RPC error:', frame.error);
          h.reject(new Error(frame.error?.message || 'request failed'));
        }
      }
    }
  }

  async _handleEvent(frame) {
    // Challenge → respond with connect handshake
    if (frame.event === 'connect.challenge') {
      console.log('[gateway] Challenge received, authenticating...');
      try {
        const helloOk = await this.request('connect', {
          minProtocol: PROTOCOL_VERSION,
          maxProtocol: PROTOCOL_VERSION,
          client: {
            id: 'cli',
            version: '1.0.0',
            platform: navigator?.platform || 'web',
            mode: 'cli',
          },
          role: 'operator',
          scopes: ['operator.admin'],
          caps: [],
          commands: [],
          permissions: {},
          auth: { token: this._token },
        });
        this.serverInfo = {
          protocol: helloOk.protocol,
          version: helloOk.server?.version,
          connId: helloOk.server?.connId,
          methods: helloOk.features?.methods || [],
          events: helloOk.features?.events || [],
          tickIntervalMs: helloOk.policy?.tickIntervalMs || 30000,
        };
        this.snapshot = helloOk.snapshot || null;
        this._setStatus('connected');
        this._reconnectDelay = 1000;
        console.log('[gateway] Connected. Agents:', this.snapshot?.health?.agents?.length || 0);
        this._emit('connected', helloOk);
      } catch (err) {
        console.error('[gateway] Handshake failed:', err.message);
        this._setStatus('error');
      }
      return;
    }

    // Tick heartbeat — update last seen
    if (frame.event === 'tick') {
      return;
    }

    // Forward all other events
    this._emit(frame.event, frame.payload);
  }

  request(method, params = {}) {
    return new Promise((resolve, reject) => {
      if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
        return reject(new Error('not connected'));
      }
      const id = String(++this.reqId);
      this.pending.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ type: 'req', id, method, params }));
      setTimeout(() => {
        if (this.pending.has(id)) {
          this.pending.delete(id);
          reject(new Error(`timeout: ${method}`));
        }
      }, 15000);
    });
  }

  on(event, fn) {
    if (!this.listeners.has(event)) this.listeners.set(event, new Set());
    this.listeners.get(event).add(fn);
    return () => this.listeners.get(event)?.delete(fn);
  }

  off(event, fn) {
    this.listeners.get(event)?.delete(fn);
  }

  _emit(event, payload) {
    this.listeners.get(event)?.forEach((fn) => {
      try { fn(payload); } catch (e) { console.error('[gateway] Event handler error:', e); }
    });
    this.listeners.get('*')?.forEach((fn) => {
      try { fn(event, payload); } catch (e) { console.error('[gateway] Wildcard handler error:', e); }
    });
  }

  // Convenience getters for snapshot data
  getAgents() {
    return this.snapshot?.health?.agents || [];
  }

  getChannels() {
    return this.snapshot?.health?.channels || {};
  }

  getHealth() {
    return this.snapshot?.health || null;
  }

  getSessionDefaults() {
    return this.snapshot?.sessionDefaults || null;
  }

  getUptime() {
    return this.snapshot?.uptimeMs || 0;
  }
}

export const gateway = new OpenClawGateway();
export default gateway;
