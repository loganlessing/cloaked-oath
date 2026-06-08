/* =================================================================
   Game — top-level orchestrator and game loop.

   Owns the high-level app state (menu | playing | paused), wires the
   systems together, and runs a single requestAnimationFrame loop.
   Systems communicate through the EventBus; Game only handles screen
   switching, the loop, and global UI (pause/settings/cinematic).
   ================================================================= */

import { bus, Events } from './EventBus.js';
import { TownMapSystem } from '../systems/TownMapSystem.js';
import { SidePanel } from '../systems/SidePanel.js';
import { BuildingPrompt } from '../systems/BuildingPrompt.js';
import { town } from '../data/townData.js';
import { player } from '../data/playerData.js';

export class Game {
  constructor() {
    // App state: 'menu' | 'playing'. Pause is a sub-flag of 'playing'.
    this.state = 'menu';
    this.paused = false;
    this._last = 0;
    this._wasCinematic = false;

    this._cacheDom();
    this._initSystems();
    this._bindUi();

    requestAnimationFrame((t) => this._loop(t));
  }

  _cacheDom() {
    this.dom = {
      mainMenu:    document.getElementById('main-menu'),
      gameView:    document.getElementById('game-view'),
      pauseOv:     document.getElementById('pause-overlay'),
      settingsOv:  document.getElementById('settings-overlay'),
      pauseBtn:    document.getElementById('pause-btn'),
      mapCanvas:   document.getElementById('map-canvas'),
      sidePane:    document.getElementById('side-pane'),
      prompt:      document.getElementById('building-prompt'),
      bars:        document.getElementById('cinematic-bars'),
    };
  }

  _initSystems() {
    this.map = new TownMapSystem(this.dom.mapCanvas, town);
    this.sidePanel = new SidePanel(this.dom.sidePane, player);
    this.prompt = new BuildingPrompt(this.dom.prompt);

    window.addEventListener('resize', () => {
      if (this.state === 'playing') {
        this.map.resize();
        if (this.sidePanel.mode === 'interior') this.sidePanel.interior.draw();
      }
    });
  }

  _bindUi() {
    // Delegate all data-action buttons across menus/overlays.
    document.body.addEventListener('click', (e) => {
      const action = e.target?.dataset?.action;
      if (!action) return;
      ({
        'start-game':    () => this.startGame(),
        'open-settings': () => this._show(this.dom.settingsOv),
        'close-settings':() => this._hide(this.dom.settingsOv),
        'resume':        () => this.resume(),
        'quit-to-menu':  () => this.quitToMenu(),
      }[action] || (() => {}))();
    });

    this.dom.pauseBtn.addEventListener('click', () => this.pause());

    // Esc toggles pause while playing.
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.state === 'playing') {
        this.paused ? this.resume() : this.pause();
      }
    });
  }

  /* ---------------- state transitions ---------------- */
  startGame() {
    this.state = 'playing';
    this.paused = false;
    this._switchScreen(this.dom.gameView);
    this.sidePanel.showTabs();
    this.map.resize();
    this.map.enable();            // kicks off the opening cinematic
    this._showBars();
  }

  pause() {
    if (this.state !== 'playing' || this.paused) return;
    this.paused = true;
    this._show(this.dom.pauseOv);
    bus.emit(Events.GAME_PAUSE);
  }

  resume() {
    this.paused = false;
    this._hide(this.dom.pauseOv);
    this._hide(this.dom.settingsOv);
    bus.emit(Events.GAME_RESUME);
  }

  quitToMenu() {
    this.state = 'menu';
    this.paused = false;
    this.map.disable();
    this.sidePanel.showTabs();
    this._hide(this.dom.pauseOv);
    this._hide(this.dom.settingsOv);
    this.prompt.hide();
    this._switchScreen(this.dom.mainMenu);
  }

  /* ---------------- helpers ---------------- */
  _switchScreen(screenEl) {
    this.dom.mainMenu.classList.remove('active');
    this.dom.gameView.classList.remove('active');
    screenEl.classList.add('active');
  }
  _show(el) { el.classList.remove('hidden'); }
  _hide(el) { el.classList.add('hidden'); }

  _showBars() {
    this.dom.bars.classList.remove('hidden');
    this._wasCinematic = true;
  }

  /* ---------------- main loop ---------------- */
  _loop(ts) {
    const dt = Math.min(50, ts - this._last || 16);
    this._last = ts;

    if (this.state === 'playing') {
      if (!this.paused) this.map.update(dt);
      this.map.render();

      // Drop the letterbox bars when the cinematic finishes.
      if (this._wasCinematic && !this.map.camera.inCinematic) {
        this.dom.bars.classList.add('hidden');
        this._wasCinematic = false;
      }
    }

    requestAnimationFrame((t) => this._loop(t));
  }
}
