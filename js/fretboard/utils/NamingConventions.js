export const SharpOctave = (sound) => sound.soundString();
export const Sharp = (sound) => sound.sound;
export const SharpOctaveLower = (sound) => sound.soundString().toLowerCase();
export const SharpLower = (sound) => sound.sound.toLowerCase();
export const FlatOctave = (sound) => (sound.flatNote ?? sound.sound) + (sound.flatOctave ?? sound.octave);
export const Flat = (sound) => (sound.flatNote ?? sound.sound);
export const FlatOctaveLower = (sound) => ((sound.flatNote ?? sound.sound) + (sound.flatOctave ?? sound.octave)).toLowerCase();
export const FlatLower = (sound) => (sound.flatNote ?? sound.sound).toLowerCase();
export const Frequency = (sound) => `${ sound.getFrequencyFromDistance().toFixed(0) }Hz`;
