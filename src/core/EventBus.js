/* =================================================================
   EventBus — tiny pub/sub used for decoupled cross-system messaging.

   Every system talks through events instead of holding hard
   references to each other. This is the backbone of the modular
   architecture: future systems (combat, quests, shops) subscribe to
   the events they care about without touching existing code.

   Usage:
     bus.on('building:enter', ({ id }) => { ... });
     bus.emit('building:enter', { id: 'tavern' });
   ================================================================= */

export class EventBus {
  constructor() {
    /** @type {Map<string, Set<Function>>} */
    this._handlers = new Map();
  }

  /** Subscribe. Returns an unsubscribe function. */
  on(event, handler) {
    if (!this._handlers.has(event)) this._handlers.set(event, new Set());
    this._handlers.get(event).add(handler);
    return () => this.off(event, handler);
  }

  /** Subscribe once; auto-removes after the first emit. */
  once(event, handler) {
    const off = this.on(event, (payload) => {
      off();
      handler(payload);
    });
    return off;
  }

  off(event, handler) {
    this._handlers.get(event)?.delete(handler);
  }

  emit(event, payload) {
    const set = this._handlers.get(event);
    if (!set) return;
    // Copy so handlers can safely (un)subscribe during dispatch.
    for (const handler of [...set]) handler(payload);
  }
}

/** Shared singleton bus for the whole game. */
export const bus = new EventBus();

/** Canonical event names. Centralised to avoid typo-driven bugs. */
export const Events = {
  SCENE_CHANGE:   'scene:change',
  GAME_PAUSE:     'game:pause',
  GAME_RESUME:    'game:resume',
  BUILDING_CLICK: 'building:click',
  BUILDING_ENTER: 'building:enter',
  INTERIOR_EXIT:  'interior:exit',
  NPC_CLICK:      'npc:click',
  DIALOGUE_OPEN:  'dialogue:open',
  DIALOGUE_CLOSE: 'dialogue:close',
  FOG_REVEAL:     'fog:reveal',
};
