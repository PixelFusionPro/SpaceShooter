// Screen Effects - Screen shake, hit flash, and other full-screen effects

class ScreenEffects {
  constructor() {
    // Screen shake
    this.shakeIntensity = 0;
    this.shakeDuration = 0;

    // Hit flash
    this.hitFlashAlpha = 0;
  }

  // Add screen shake
  shake(intensity = 5, duration = 10) {
    this.shakeIntensity = Math.max(this.shakeIntensity, intensity);
    this.shakeDuration = Math.max(this.shakeDuration, duration);
  }

  // Trigger hit flash
  flashHit(alpha = 0.6) {
    this.hitFlashAlpha = Math.max(this.hitFlashAlpha, alpha);
  }

  // Update effects
  update() {
    // Update shake
    if (this.shakeDuration > 0) {
      this.shakeDuration--;
      if (this.shakeDuration === 0) {
        this.shakeIntensity = 0;
      }
    }

    // Update hit flash
    if (this.hitFlashAlpha > 0) {
      this.hitFlashAlpha -= 0.1;
      if (this.hitFlashAlpha < 0) this.hitFlashAlpha = 0;
    }
  }

  // Get shake offset
  getShakeOffset() {
    if (this.shakeIntensity === 0) return { x: 0, y: 0 };
    const pulseOffset = Math.sin(this.shakeDuration * 0.5) * 2;
    return {
      x: (Math.random() - 0.5) * (this.shakeIntensity + pulseOffset),
      y: (Math.random() - 0.5) * (this.shakeIntensity + pulseOffset)
    };
  }

  // Draw hit flash
  drawHitFlash(ctx, canvas) {
    if (this.hitFlashAlpha > 0) {
      ctx.save();
      ctx.fillStyle = `rgba(255, 255, 255, ${this.hitFlashAlpha})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.restore();
    }
  }
}
