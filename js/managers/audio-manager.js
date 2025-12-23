// Audio Manager - Handles all game audio with sound pooling

class AudioManager {
  constructor() {
    this.soundPool = new Map();
    this.music = new Map();
    this.sfxVolume = 0.7;
    this.musicVolume = 0.5;
    this.isMuted = false;
    this.currentMusic = null;
    this.audioContext = null;
    this.masterGain = null;

    // Initialize Web Audio API for better control
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      this.masterGain = this.audioContext.createGain();
      this.masterGain.connect(this.audioContext.destination);
    } catch (e) {
      console.warn('Web Audio API not supported, falling back to HTML5 Audio');
    }
  }

  // Load a sound effect into pool
  loadSound(id, poolSize = 3) {
    const pool = [];

    // Create pooled sound instances for preventing cutoff
    for (let i = 0; i < poolSize; i++) {
      const audio = {
        instance: null,
        ready: false,
        synth: true // Use synthesized sound
      };
      pool.push(audio);
    }

    this.soundPool.set(id, { pool, index: 0 });
  }

  // Play sound effect with pooling
  playSound(id, volume = 1.0, pitch = 1.0) {
    if (this.isMuted) return;

    const soundData = this.soundPool.get(id);
    if (!soundData) {
      // Lazily create sound if not loaded
      this.loadSound(id);
      return this.playSynthSound(id, volume, pitch);
    }

    this.playSynthSound(id, volume, pitch);
  }

  // Synthesize sound effects using Web Audio API
  playSynthSound(id, volume = 1.0, pitch = 1.0) {
    if (!this.audioContext) return;

    const now = this.audioContext.currentTime;
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    const filter = this.audioContext.createBiquadFilter();

    oscillator.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.masterGain);

    // Sound-specific synthesis
    switch(id) {
      case 'shoot_laser':
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(800 * pitch, now);
        oscillator.frequency.exponentialRampToValueAtTime(200 * pitch, now + 0.1);
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(2000, now);
        gainNode.gain.setValueAtTime(0.3 * volume * this.sfxVolume, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        oscillator.start(now);
        oscillator.stop(now + 0.1);
        break;

      case 'enemy_hit':
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(150 * pitch, now);
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(500, now);
        gainNode.gain.setValueAtTime(0.2 * volume * this.sfxVolume, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
        oscillator.start(now);
        oscillator.stop(now + 0.08);
        break;

      case 'enemy_death':
        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(400 * pitch, now);
        oscillator.frequency.exponentialRampToValueAtTime(50, now + 0.2);
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(800, now);
        gainNode.gain.setValueAtTime(0.25 * volume * this.sfxVolume, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
        oscillator.start(now);
        oscillator.stop(now + 0.2);
        break;

      case 'boss_death':
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(200 * pitch, now);
        oscillator.frequency.exponentialRampToValueAtTime(30, now + 0.5);
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1000, now);
        filter.frequency.exponentialRampToValueAtTime(100, now + 0.5);
        gainNode.gain.setValueAtTime(0.4 * volume * this.sfxVolume, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
        oscillator.start(now);
        oscillator.stop(now + 0.5);
        break;

      case 'powerup_collect':
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(400 * pitch, now);
        oscillator.frequency.setValueAtTime(600 * pitch, now + 0.05);
        oscillator.frequency.setValueAtTime(800 * pitch, now + 0.1);
        gainNode.gain.setValueAtTime(0.25 * volume * this.sfxVolume, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
        oscillator.start(now);
        oscillator.stop(now + 0.15);
        break;

      case 'powerup_heal':
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(600 * pitch, now);
        oscillator.frequency.setValueAtTime(800 * pitch, now + 0.1);
        gainNode.gain.setValueAtTime(0.3 * volume * this.sfxVolume, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
        oscillator.start(now);
        oscillator.stop(now + 0.2);
        break;

      case 'powerup_speed':
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(200 * pitch, now);
        oscillator.frequency.exponentialRampToValueAtTime(600 * pitch, now + 0.15);
        gainNode.gain.setValueAtTime(0.25 * volume * this.sfxVolume, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
        oscillator.start(now);
        oscillator.stop(now + 0.15);
        break;

      case 'powerup_shield':
        oscillator.type = 'triangle';
        oscillator.frequency.setValueAtTime(300 * pitch, now);
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(500, now);
        gainNode.gain.setValueAtTime(0.25 * volume * this.sfxVolume, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
        oscillator.start(now);
        oscillator.stop(now + 0.2);
        break;

      case 'powerup_multishot':
        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(400 * pitch, now);
        oscillator.frequency.setValueAtTime(500 * pitch, now + 0.05);
        oscillator.frequency.setValueAtTime(600 * pitch, now + 0.1);
        gainNode.gain.setValueAtTime(0.25 * volume * this.sfxVolume, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
        oscillator.start(now);
        oscillator.stop(now + 0.15);
        break;

      case 'player_damage':
        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(100 * pitch, now);
        gainNode.gain.setValueAtTime(0.35 * volume * this.sfxVolume, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
        oscillator.start(now);
        oscillator.stop(now + 0.15);
        break;

      case 'player_death':
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(300 * pitch, now);
        oscillator.frequency.exponentialRampToValueAtTime(50, now + 0.4);
        gainNode.gain.setValueAtTime(0.4 * volume * this.sfxVolume, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
        oscillator.start(now);
        oscillator.stop(now + 0.4);
        break;

      case 'wave_complete':
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(400 * pitch, now);
        oscillator.frequency.setValueAtTime(500 * pitch, now + 0.1);
        oscillator.frequency.setValueAtTime(600 * pitch, now + 0.2);
        gainNode.gain.setValueAtTime(0.3 * volume * this.sfxVolume, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        oscillator.start(now);
        oscillator.stop(now + 0.3);
        break;

      case 'tower_fire':
        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(600 * pitch, now);
        oscillator.frequency.exponentialRampToValueAtTime(200 * pitch, now + 0.08);
        gainNode.gain.setValueAtTime(0.2 * volume * this.sfxVolume, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
        oscillator.start(now);
        oscillator.stop(now + 0.08);
        break;

      case 'structure_build':
        oscillator.type = 'triangle';
        oscillator.frequency.setValueAtTime(200 * pitch, now);
        oscillator.frequency.setValueAtTime(400 * pitch, now + 0.15);
        gainNode.gain.setValueAtTime(0.25 * volume * this.sfxVolume, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
        oscillator.start(now);
        oscillator.stop(now + 0.2);
        break;

      case 'structure_destroy':
        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(300 * pitch, now);
        oscillator.frequency.exponentialRampToValueAtTime(50, now + 0.3);
        gainNode.gain.setValueAtTime(0.3 * volume * this.sfxVolume, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        oscillator.start(now);
        oscillator.stop(now + 0.3);
        break;

      case 'achievement':
        // Ascending arpeggio
        const frequencies = [400, 500, 600, 800];
        frequencies.forEach((freq, i) => {
          const osc = this.audioContext.createOscillator();
          const gain = this.audioContext.createGain();
          osc.connect(gain);
          gain.connect(this.masterGain);
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq * pitch, now + i * 0.08);
          gain.gain.setValueAtTime(0.2 * volume * this.sfxVolume, now + i * 0.08);
          gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.08 + 0.15);
          osc.start(now + i * 0.08);
          osc.stop(now + i * 0.08 + 0.15);
        });
        return; // Already handled

      default:
        // Generic beep
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(440 * pitch, now);
        gainNode.gain.setValueAtTime(0.2 * volume * this.sfxVolume, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        oscillator.start(now);
        oscillator.stop(now + 0.1);
    }
  }

  // Play background music (synthesized ambient)
  playMusic(track = 'gameplay') {
    if (this.isMuted || !this.audioContext) return;

    // Stop current music
    this.stopMusic();

    // Simple ambient music using oscillators
    const now = this.audioContext.currentTime;

    if (track === 'gameplay') {
      // Ambient space music - low droning bass
      const bass = this.audioContext.createOscillator();
      const bassGain = this.audioContext.createGain();
      bass.connect(bassGain);
      bassGain.connect(this.masterGain);
      bass.type = 'sine';
      bass.frequency.setValueAtTime(55, now); // Low A
      bassGain.gain.setValueAtTime(0.1 * this.musicVolume, now);
      bass.start(now);

      this.currentMusic = { bass, bassGain, track };
    }
  }

  stopMusic() {
    if (this.currentMusic) {
      const now = this.audioContext.currentTime;
      if (this.currentMusic.bass) {
        this.currentMusic.bassGain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
        this.currentMusic.bass.stop(now + 0.5);
      }
      this.currentMusic = null;
    }
  }

  // Volume controls
  setSFXVolume(vol) {
    this.sfxVolume = Math.max(0, Math.min(1, vol));
  }

  setMusicVolume(vol) {
    this.musicVolume = Math.max(0, Math.min(1, vol));
    if (this.currentMusic && this.currentMusic.bassGain) {
      this.currentMusic.bassGain.gain.setValueAtTime(0.1 * this.musicVolume, this.audioContext.currentTime);
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.masterGain) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 1, this.audioContext.currentTime);
    }
  }

  setMute(muted) {
    this.isMuted = muted;
    if (this.masterGain) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 1, this.audioContext.currentTime);
    }
  }

  // Resume audio context (needed for autoplay policies)
  resume() {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
  }
}
