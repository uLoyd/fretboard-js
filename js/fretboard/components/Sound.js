export const sounds = ['A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#'];
export const flats =  [null, 'Bb', 'Cb', null, 'Db', null, 'Eb', 'Fb', null, 'Gb', null, 'Ab'];
export const A4 = 440; // Sound A in 4th octave by ISO standard is 440 Hz

export class Sound {
  constructor(sound, octave) {
    this.sound = Number.isInteger(sound) ? sounds[sound] : sound;
    this.octave = parseFloat(octave);
    this.soundIndex = sounds.indexOf(this.sound);
    this.flatNote = flats[this.soundIndex] ?? null;
    this.flatOctave = this.flatNote ? this.flatNote === 'Cb' ? this.octave + 1 : this.octave : null;
  }

  static frequencyConstructor(frequency) {
    const dist = Sound.getDistanceFromFrequency(frequency);
    const note = Sound.getNoteFromDistance(dist);
    const octave = Sound.getOctaveFromDistance(dist);

    return new Sound(note, octave);
  }

  static getDistanceFromFrequency(fx) {
    const result = Math.log(fx / A4) / Math.pow(2, 1 / 12);

    return Math.round(result);
  }

  // Distance relative to A4 (arguments defaults to "this" object)
  getDistanceFromNote(note = this.sound, octave = this.octave) {
    const basePos = sounds.indexOf(note);
    const multiplyOctave = octave - 4; // minus 4 because we're counting from A4
    let pos = 12 * multiplyOctave + basePos;
    if(basePos > 2) pos -= 12;         // offset made because in music the scale starts at C not A
    return pos;
  }

  // Distance relative to A4 - returns only the sound symbol without the octave
  static getNoteFromDistance(step) {
    let id = (step > 11 || step < -11 ? step % 12 : step);
    id = (id < 0 ? 12 + id : id);

    return Math.round(id);
  }

  // Distance relative to A4
  getFrequencyFromDistance(distance = this.getDistanceFromNote()) {
    return A4 * Math.pow(2, distance / 12); // Returns a perfect frequency of note x steps from A4
  }

  // Distance relative to A4
  static getOctaveFromDistance(distance) {
    let octaves = 4;

    while(true){
      if(distance < -11){     // Checking if offset is needed as scale starts at C and not A
        --octaves;
        distance += 12;
      }
      else if(distance > 11){ // Checking if offset is needed as scale starts at C and not A
        ++octaves;
        distance -= 12;
      }
      else
        break;
    }

    // sounds start from C while in sounds array those are sorted alphabetically
    // so lines below apply offset if needed
    if(distance < -9) octaves--;
    else if(distance > 2) octaves++;
    return octaves;
  }

  // arguments are supposed to be instances of Sound class
  distanceBetweenNotes(sound1 = new Sound('A', 4), sound2 = this) {
    const dist1 = this.getDistanceFromNote(sound1.sound, sound1.octave);
    const dist2 = this.getDistanceFromNote(sound2.sound, sound2.octave);

    return dist1 - dist2;
  }

  // compares sounds without octaves
  soundDistanceForward(sound1 = new Sound('A', 4), sound2 = this) {
    const id1 = sounds.indexOf(sound1.sound);
    const id2 = sounds.indexOf(sound2.sound);

    const res = id1 - id2;

    return res < 0 ? 12 + res : res;
  }

  soundString = () => `${this.sound}${this.octave}`;
}
