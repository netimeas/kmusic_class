// audioEngine.ts

export type Region = 'western' | 'gyeonggi' | 'pyeongan' | 'jeolla';
export type NoteName = 'do' | 're' | 'mi' | 'fa' | 'sol' | 'la' | 'ti';

const FREQ = {
  C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.00, A4: 440.00, B4: 493.88,
  C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99, A5: 880.00,
};

export type NoteDef = { freq: number; effect: 'none' | 'vibrato' | 'bending' };

export const toriMapping: Record<Region, Record<NoteName, NoteDef>> = {
  western: {
    do: { freq: FREQ.C4, effect: 'none' }, re: { freq: FREQ.D4, effect: 'none' },
    mi: { freq: FREQ.E4, effect: 'none' }, fa: { freq: FREQ.F4, effect: 'none' },
    sol: { freq: FREQ.G4, effect: 'none' }, la: { freq: FREQ.A4, effect: 'none' },
    ti: { freq: FREQ.B4, effect: 'none' }
  },
  gyeonggi: { 
    do: { freq: FREQ.C4, effect: 'none' }, re: { freq: FREQ.D4, effect: 'none' },
    mi: { freq: FREQ.E4, effect: 'none' }, fa: { freq: FREQ.F4, effect: 'none' },
    sol: { freq: FREQ.G4, effect: 'none' }, la: { freq: FREQ.A4, effect: 'none' },
    ti: { freq: FREQ.B4, effect: 'none' }
  },
  pyeongan: { 
    do: { freq: FREQ.C5, effect: 'bending' }, re: { freq: FREQ.D4, effect: 'none' },
    mi: { freq: FREQ.E4, effect: 'none' }, fa: { freq: FREQ.F4, effect: 'none' },
    sol: { freq: FREQ.G4, effect: 'none' }, la: { freq: FREQ.A4, effect: 'vibrato' },
    ti: { freq: FREQ.B4, effect: 'none' }
  },
  jeolla: { 
    do: { freq: FREQ.C5, effect: 'bending' }, re: { freq: FREQ.D4, effect: 'none' },
    mi: { freq: FREQ.E4, effect: 'vibrato' }, fa: { freq: FREQ.F4, effect: 'none' },
    sol: { freq: FREQ.G4, effect: 'none' }, la: { freq: FREQ.A4, effect: 'none' },
    ti: { freq: FREQ.B4, effect: 'none' }
  }
};

// 동요 멜로디 데이터 업데이트
const SONGS: Record<string, NoteName[]> = {
  schoolBell: ['sol', 'sol', 'la', 'la', 'sol', 'sol', 'mi'], // 1번 도입 전용
  butterfly: ['sol', 'mi', 'mi', 'fa', 're', 're', 'do', 're', 'mi', 'fa', 'sol', 'sol', 'sol'],
  airplane: ['mi', 're', 'do', 're', 'mi', 'mi', 'mi', 're', 're', 're', 'mi', 'sol', 'sol'],
  littleStar: ['do', 'do', 'sol', 'sol', 'la', 'la', 'sol', 'fa', 'fa', 'mi', 'mi', 're', 're', 'do'],
  threeBears: ['do', 'do', 'do', 'do', 'do', 'mi', 'sol', 'sol', 'mi', 'do', 'sol', 'sol', 'mi', 'sol', 'sol', 'mi', 'do', 'do', 'do']
};

let audioCtx: AudioContext | null = null;

const initAudio = () => {
  if (!audioCtx) audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
};

export const playMelody = (notes: NoteName[], region: Region, onComplete: () => void) => {
  initAudio();
  const startTime = audioCtx!.currentTime;
  const noteDuration = 0.5;

  notes.forEach((noteName, index) => {
    const noteStartTime = startTime + index * noteDuration;
    const { freq, effect } = toriMapping[region][noteName];
    
    const isLastNote = index === notes.length - 1;
    const duration = isLastNote ? noteDuration * 2 : noteDuration;

    if (region === 'western') {
      playWesternSynth(audioCtx!, freq, noteStartTime, duration);
    } else {
      playGayageum(audioCtx!, freq, noteStartTime, duration, effect, region);
    }
  });

  setTimeout(onComplete, (notes.length + 1) * noteDuration * 1000);
};

export const playSong = (songId: string, region: Region, onComplete: () => void) => {
  if (SONGS[songId]) playMelody(SONGS[songId], region, onComplete);
};

export const playSingleNote = (noteName: NoteName, region: Region) => {
  initAudio();
  const { freq, effect } = toriMapping[region][noteName];
  if (region === 'western') {
    playWesternSynth(audioCtx!, freq, audioCtx!.currentTime, 1.0);
  } else {
    playGayageum(audioCtx!, freq, audioCtx!.currentTime, 1.5, effect, region);
  }
};

const playWesternSynth = (ctx: AudioContext, freq: number, startTime: number, duration: number) => {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.value = freq;
  
  gain.gain.setValueAtTime(0, startTime);
  gain.gain.linearRampToValueAtTime(0.3, startTime + 0.05);
  gain.gain.setValueAtTime(0.3, startTime + duration - 0.1);
  gain.gain.linearRampToValueAtTime(0, startTime + duration);
  
  osc.connect(gain); gain.connect(ctx.destination);
  osc.start(startTime); osc.stop(startTime + duration);
};

const playGayageum = (ctx: AudioContext, freq: number, startTime: number, duration: number, effect: string, region: Region) => {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const filter = ctx.createBiquadFilter();

  osc.type = 'sawtooth';
  gain.gain.setValueAtTime(0, startTime);
  gain.gain.linearRampToValueAtTime(0.8, startTime + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.001, startTime + 1.5); 

  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(3000, startTime);
  filter.frequency.exponentialRampToValueAtTime(300, startTime + 0.5);

  osc.connect(filter); filter.connect(gain); gain.connect(ctx.destination);
  osc.frequency.value = freq;

  if (effect === 'vibrato') {
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.frequency.value = region === 'jeolla' ? 5 : 7; 
    lfoGain.gain.value = region === 'jeolla' ? freq * 0.04 : freq * 0.02; 
    lfo.connect(lfoGain); lfoGain.connect(osc.frequency);
    lfo.start(startTime); lfo.stop(startTime + 1.5);
  } else if (effect === 'bending') {
    osc.frequency.setValueAtTime(freq, startTime);
    osc.frequency.setTargetAtTime(freq * 0.89, startTime + 0.2, 0.1); 
  }

  osc.start(startTime); osc.stop(startTime + 2.0);
};