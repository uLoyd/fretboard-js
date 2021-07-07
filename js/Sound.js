import { A4, sounds } from "./fretboardModules.js";

export class Sound {
  constructor(soundSymbol, octave) {
    this.sound = soundSymbol;
    this.octave = octave;
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

    if(distance < -9) octaves--;
    if(distance > 2) octaves++;
    return octaves;
  }

  // arguments are supposed to be instances of Sound class
  distanceBetweenNotes(sound1 = new Sound('A', 4), sound2 = this) {
    const dist1 = this.getDistanceFromNote(sound1.sound, sound1.octave);
    const dist2 = this.getDistanceFromNote(sound2.sound, sound2.octave);

    return dist1 - dist2;
  }

  toString = () => `${this.sound}${this.octave}`;
}
