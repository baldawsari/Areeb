const DEFAULT_URL = import.meta.env.VITE_GATEWAY_URL || 'ws://localhost:18789';
const DEFAULT_TOKEN = import.meta.env.VITE_GATEWAY_TOKEN || '';

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
    } catch {
      this._setStatus('error');
      this._scheduleReconnect();
      return;
    }

    this.ws.onmessage = (e) => {
      try { this._handleFrame(JSON.parse(e.data)); } catch {}
    };

    this.ws.onerror = () => this._setStatus('error');

    this.ws.onclose = () => {
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
    for (const [, { reject }] of this.pending) reject(new Error('disconnected'));
    this.pending.clear();
    this.listeners.clear();
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
      const h = this.pending.get(frame.id);
      if (h) {
        this.pending.delete(frame.id);
        frame.ok ? h.resolve(frame.payload) : h.reject(new Error(frame.error?.message || 'failed'));
      }
    }
  }

  async _handleEvent(frame) {
    if (frame.event === 'connect.challenge') {
      try {
        await this.request('connect', {
          minProtocol: 1,
          maxProtocol: 1,
          client: 'agent-dashboard',
          role: 'operator',
          scopes: ['operator.read', 'operator.write'],
          auth: { token: this._token },
        });
        this._setStatus('connected');
        this._reconnectDelay = 1000;
        this._emit('connected', {});
      } catch {
        this._setStatus('error');
      }
      return;
    }
    this._emit(frame.event, frame.payload);
  }

  request(method, params = {}) {
    return new Promise((resolve, reject) => {
      if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
        return reject(new Error('not connected'));
      }
      const id = ++this.reqId;
      this.pending.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ type: 'req', id, method, params }));
      setTimeout(() => {
        if (this.pending.has(id)) {
          this.pending.delete(id);
          reject(new Error('timeout'));
        }
      }, 15000);
    });
  }

  on(event, fn) {
    if (!this.listeners.has(event)) this.listeners.set(event, new Set());
    this.listeners.get(event).add(fn);
    return () => this.listeners.get(event)?.delete(fn);
  }

  _emit(event, payload) {
    this.listeners.get(event)?.forEach((fn) => { try { fn(payload); } catch {} });
    this.listeners.get('*')?.forEach((fn) => { try { fn(event, payload); } catch {} });
  }

  // Convenience methods
  health() { return this.request('gateway.health'); }
  listSessions() { return this.request('sessions.list'); }
  sessionHistory(sessionKey) { return this.request('sessions.history', { sessionKey }); }
  channelsStatus() { return this.request('channels.status'); }
  sendToSession(sessionKey, content) { return this.request('sessions.send', { sessionKey, content }); }
  getConfig() { return this.request('config.get'); }
}

export const gateway = new OpenClawGateway();
export default gateway;
