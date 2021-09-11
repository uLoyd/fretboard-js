import { uuidv4 } from "./utils.js";
import { Sound, sounds } from "./Sound.js";

export class StringLane extends Sound {
  constructor({ sound = 'A', octave = 4, frets = 12 }) {
    super(sound, octave);

    this.id = uuidv4(); // StringLane has an id in case of two strings with the same sound and octave in 1 fretboard
    this.frets = frets;
  }

  static bulkConstructor(SoundProps, frets){
    return SoundProps.map(({ sound, octave }) => new StringLane({ sound, octave, frets }));
  }

  findSoundPlace(soundIndex) {
    if(!this.tuning)
      return;

    const places = [];
    const currentTuning = sounds.indexOf(this.sound);
    const diff = currentTuning - soundIndex;
    let currentToPush = diff <= 0 ? Math.abs(diff) : 12 - diff;

    while(this.frets > currentToPush){
      places.push(currentToPush);
      currentToPush += 12;
    }

    return places;
  }

  findSoundOctavePlace = sound => this.distanceBetweenNotes(sound);
}
