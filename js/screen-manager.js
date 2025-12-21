// Screen Manager - Handles all screen state transitions

class ScreenManager {
  constructor() {
    this.currentScreen = 'MAIN_MENU';
    this.screens = {
      MAIN_MENU: 'mainMenu',
      GAMEPLAY: 'gameContainer',
      PAUSED: 'pauseScreen',
      GAME_OVER: 'gameOverScreen'
    };
    this.overlays = {
      SHOP: 'shopOverlay',
      INVENTORY: 'inventoryOverlay',
      WAVE_INTRO: 'waveIntro',
      WAVE_RECAP: 'waveRecap'
    };
    
    // Initialize - show main menu on load
    this.showScreen('MAIN_MENU');
  }

  // Show a screen (hides others)
  showScreen(screenName) {
    if (!this.screens[screenName]) {
      return;
    }

    // Hide all screens first
    Object.values(this.screens).forEach(screenId => {
      const element = document.getElementById(screenId);
      if (element) {
        element.style.display = 'none';
        element.classList.remove('show');
      }
    });

    // Show requested screen
    const element = document.getElementById(this.screens[screenName]);
    if (element) {
      if (screenName === 'GAMEPLAY') {
        element.style.display = 'block';
      } else {
        element.style.display = 'flex';
      }
      this.currentScreen = screenName;
    }
  }

  // Show an overlay (doesn't hide other overlays)
  showOverlay(overlayName) {
    if (this.overlays[overlayName]) {
      const element = document.getElementById(this.overlays[overlayName]);
      if (element) {
        element.style.display = 'flex';
        element.classList.add('show');
      }
    } else {
      // Try direct ID
      const element = document.getElementById(overlayName);
      if (element) {
        element.style.display = 'flex';
        element.classList.add('show');
      }
    }
  }

  // Hide an overlay
  hideOverlay(overlayName) {
    if (this.overlays[overlayName]) {
      const element = document.getElementById(this.overlays[overlayName]);
      if (element) {
        element.style.display = 'none';
        element.classList.remove('show');
      }
    } else {
      // Try direct ID
      const element = document.getElementById(overlayName);
      if (element) {
        element.style.display = 'none';
        element.classList.remove('show');
      }
    }
  }

  // Check if overlay is visible
  isOverlayVisible(overlayName) {
    if (this.overlays[overlayName]) {
      const element = document.getElementById(this.overlays[overlayName]);
      return element && element.classList.contains('show');
    }
    const element = document.getElementById(overlayName);
    return element && element.classList.contains('show');
  }

  // Get current screen
  getCurrentScreen() {
    return this.currentScreen;
  }
}

// Global screen manager instance
let screenManager;

// Initialize screen manager on page load
function initScreenManager() {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      screenManager = new ScreenManager();
    });
  } else {
    // DOM already loaded
    screenManager = new ScreenManager();
  }
}

// Initialize immediately
initScreenManager();
