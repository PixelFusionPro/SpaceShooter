// Input Controls

class Controls {
  constructor(canvas, onPauseToggle = null) {
    this.canvas = canvas;
    this.keys = {};
    this.touchStartX = 0;
    this.touchStartY = 0;
    this.isPaused = false;
    this.onPauseToggle = onPauseToggle;

    // Store handler references for cleanup
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleKeyUp = this.handleKeyUp.bind(this);
    this.handleTouchStart = this.handleTouchStart.bind(this);
    this.handleTouchEnd = this.handleTouchEnd.bind(this);

    this.setupKeyboard();
    this.setupTouch();
  }

  handleKeyDown(e) {
    this.keys[e.key] = true;

    // Pause toggle
    if (e.key === 'p' || e.key === 'P') {
      this.togglePause();
    }
  }

  handleKeyUp(e) {
    this.keys[e.key] = false;
  }

  handleTouchStart(e) {
    const t = e.touches[0];
    this.touchStartX = t.clientX;
    this.touchStartY = t.clientY;
  }

  handleTouchEnd(e) {
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
  }

  setupKeyboard() {
    document.addEventListener('keydown', this.handleKeyDown);
    document.addEventListener('keyup', this.handleKeyUp);
  }

  setupTouch() {
    this.canvas.addEventListener('touchstart', this.handleTouchStart);
    this.canvas.addEventListener('touchend', this.handleTouchEnd);
  }

  // Cleanup method to remove event listeners
  destroy() {
    document.removeEventListener('keydown', this.handleKeyDown);
    document.removeEventListener('keyup', this.handleKeyUp);
    this.canvas.removeEventListener('touchstart', this.handleTouchStart);
    this.canvas.removeEventListener('touchend', this.handleTouchEnd);
  }

  updatePlayer(player) {
    // Spaceship controls: realistic physics
    // Rotation controls (A/D or Left/Right)
    let rotationInput = 0;
    if (this.keys['ArrowLeft'] || this.keys['a'] || this.keys['A']) {
      rotationInput = -1; // Rotate left
    }
    if (this.keys['ArrowRight'] || this.keys['d'] || this.keys['D']) {
      rotationInput = 1; // Rotate right
    }
    
    // Apply rotation acceleration
    if (rotationInput !== 0) {
      player.angularVelocity += rotationInput * player.rotationSpeed;
      // Limit angular speed
      if (Math.abs(player.angularVelocity) > player.maxAngularSpeed) {
        player.angularVelocity = Math.sign(player.angularVelocity) * player.maxAngularSpeed;
      }
    }
    
    // Thrust controls (W/Up for forward thrust, S/Down for reverse)
    let thrustInput = 0;
    if (this.keys['ArrowUp'] || this.keys['w'] || this.keys['W']) {
      thrustInput = 1; // Forward thrust
    }
    if (this.keys['ArrowDown'] || this.keys['s'] || this.keys['S']) {
      thrustInput = -0.5; // Reverse thrust (weaker)
    }
    
    // Apply thrust in direction ship is facing (realistic spaceship physics)
    if (thrustInput !== 0) {
      player.thrustActive = true;
      // Thrust in the direction the ship is facing
      const thrustX = Math.cos(player.angle) * player.acceleration * player.speed * thrustInput;
      const thrustY = Math.sin(player.angle) * player.acceleration * player.speed * thrustInput;
      
      // Update velocity with thrust
      player.vx += thrustX;
      player.vy += thrustY;
      
      // Limit max speed
      const currentSpeed = Math.hypot(player.vx, player.vy);
      const maxSpeed = player.speed * 1.3; // Slight overspeed allowed
      if (currentSpeed > maxSpeed) {
        player.vx = (player.vx / currentSpeed) * maxSpeed;
        player.vy = (player.vy / currentSpeed) * maxSpeed;
      }
    } else {
      player.thrustActive = false;
    }
  }

  togglePause() {
    this.isPaused = !this.isPaused;
    if (this.onPauseToggle) {
      this.onPauseToggle(this.isPaused);
    }
  }
}
