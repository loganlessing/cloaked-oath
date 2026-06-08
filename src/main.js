/* =================================================================
   main.js — entry point.

   Boots the menu backdrop art and starts the Game orchestrator once
   the DOM is ready. Everything else is wired through the EventBus and
   the systems Game instantiates.
   ================================================================= */

import { Game } from './core/Game.js';
import { menuBackdropUrl } from './art/sprites/menuArt.js';

function boot() {
  // Paint the procedural menu backdrop.
  const art = document.getElementById('menu-art');
  if (art) art.style.backgroundImage = `url(${menuBackdropUrl()})`;

  // Show the menu screen and start the loop.
  document.getElementById('main-menu').classList.add('active');
  window.game = new Game(); // exposed for debugging/future console tools

  // Deep-link: open directly into the town with #play (handy for testing).
  if (location.hash === '#play') window.game.startGame();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
