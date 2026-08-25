/**
 * Web Audio API Engine for real-time interactive previews and synthesized soundscapes.
 * Provides instant tactile sound when testing genres or demo player.
 */

class AudioSynthEngine {
  constructor() {
    this.ctx = null;
    this.isPlaying = false;
    this.currentLoop = null;
    this.analyser = null;
  }

  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContext();
      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 64;
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playNote(freq, type = 'sine', duration = 0.5, delay = 0, gainLevel = 0.2) {
    this.init();
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime + delay);

    gain.gain.setValueAtTime(0.001, this.ctx.currentTime + delay);
    gain.gain.exponentialRampToValueAtTime(gainLevel, this.ctx.currentTime + delay + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + delay + duration);

    osc.connect(gain);
    gain.connect(this.analyser);
    this.analyser.connect(this.ctx.destination);

    osc.start(this.ctx.currentTime + delay);
    osc.stop(this.ctx.currentTime + delay + duration);
  }

  playChordProgression(genre = 'balada', onTick) {
    this.stop();
    this.init();
    this.isPlaying = true;

    // Frecuencias para distintas escalas / acordes según género
    const genreScales = {
      balada: [
        [261.63, 329.63, 392.00], // C
        [220.00, 261.63, 329.63], // Am
        [174.61, 220.00, 261.63], // F
        [196.00, 246.94, 293.66], // G
      ],
      urbano: [
        [146.83, 220.00, 293.66], // Dm
        [174.61, 261.63, 349.23], // F
        [196.00, 293.66, 392.00], // G
        [130.81, 196.00, 261.63], // C
      ],
      pop: [
        [196.00, 246.94, 293.66, 392.00], // G
        [146.83, 220.00, 293.66], // D
        [164.81, 196.00, 246.94], // Em
        [130.81, 164.81, 196.00], // C
      ],
      vallenato: [
        [261.63, 329.63, 392.00], // C
        [196.00, 246.94, 293.66], // G
        [220.00, 261.63, 329.63], // Am
        [174.61, 220.00, 261.63], // F
      ],
      rock: [
        [164.81, 246.94, 329.63], // E5
        [196.00, 293.66, 392.00], // G5
        [146.83, 220.00, 293.66], // D5
        [220.00, 329.63, 440.00], // A5
      ],
      bolero: [
        [220.00, 261.63, 329.63], // Am
        [146.83, 174.61, 220.00], // Dm
        [164.81, 207.65, 246.94], // E7
        [220.00, 261.63, 329.63], // Am
      ]
    };

    const chords = genreScales[genre.toLowerCase()] || genreScales.balada;
    let step = 0;

    const tick = () => {
      if (!this.isPlaying) return;
      const currentChord = chords[step % chords.length];
      
      // Arpegio suave
      currentChord.forEach((freq, idx) => {
        this.playNote(freq, genre === 'rock' ? 'sawtooth' : 'triangle', 0.8, idx * 0.15, 0.15);
      });

      // Golpe rítmico sutil si es urbano o pop
      if (genre === 'urbano' || genre === 'pop') {
        this.playNote(80, 'sine', 0.2, 0, 0.3); // kick
        this.playNote(800, 'triangle', 0.1, 0.3, 0.08); // hi-hat
      }

      if (onTick) onTick(step % chords.length);
      step++;
      this.currentLoop = setTimeout(tick, 900);
    };

    tick();
  }

  stop() {
    this.isPlaying = false;
    if (this.currentLoop) {
      clearTimeout(this.currentLoop);
      this.currentLoop = null;
    }
  }

  getFrequencyData() {
    if (!this.analyser) return new Uint8Array(32);
    const data = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(data);
    return data;
  }
}

export const synth = new AudioSynthEngine();
