// Input Controls

class Controls {
  constructor(canvas, onPauseToggle = null) {
    this.canvas = canvas;
    this.keys = {};
    this.touchStartX = 0;
    this.touchStartY = 0;
    this.isPaused = false;
    this.onPauseToggle = onPauseToggle;

    this.setupKeyboard();
    this.setupTouch();
  }

  setupKeyboard() {
    document.addEventListener('keydown', (e) => {
      this.keys[e.key] = true;

      // Pause toggle
      if (e.key === 'p' || e.key === 'P') {
        this.togglePause();
      }
    });

    document.addEventListener('keyup', (e) => {
      this.keys[e.key] = false;
    });
  }

  setupTouch() {
    this.canvas.addEventListener('touchstart', (e) => {
      const t = e.touches[0];
      this.touchStartX = t.clientX;
      this.touchStartY = t.clientY;
    });

    this.canvas.addEventListener('touchend', (e) => {
      const dx = e.changedTouches[0].clientX - this.touchStartX;
      const dy = e.changedTouches[0].clientY - this.touchStartY;

      // Simulate key press based on swipe
      if (Math.abs(dx) > Math.abs(dy)) {
        if (dx > 0) {
          this.keys['d'] = true;
          setTimeout(() => this.keys['d'] = false, 300);
        } else {
          this.keys['a'] = true;
          setTimeout(() => this.keys['a'] = false, 300);
        }
      } else {
        if (dy > 0) {
          this.keys['s'] = true;
          setTimeout(() => this.keys['s'] = false, 300);
        } else {
          this.keys['w'] = true;
          setTimeout(() => this.keys['w'] = false, 300);
        }
      }
    });
  }

  updatePlayer(player) {
    player.vx = 0;
    player.vy = 0;

    if (this.keys['ArrowLeft'] || this.keys['a'] || this.keys['A']) {
      player.vx = -player.speed;
    }
    if (this.keys['ArrowRight'] || this.keys['d'] || this.keys['D']) {
      player.vx = player.speed;
    }
    if (this.keys['ArrowUp'] || this.keys['w'] || this.keys['W']) {
      player.vy = -player.speed;
    }
    if (this.keys['ArrowDown'] || this.keys['s'] || this.keys['S']) {
      player.vy = player.speed;
    }
  }

  togglePause() {
    this.isPaused = !this.isPaused;
    if (this.onPauseToggle) {
      this.onPauseToggle(this.isPaused);
    }
  }
}
