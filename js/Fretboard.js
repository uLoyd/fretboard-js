import { Tuning } from "./Tuning.js";
import { SoundStorage } from "./SoundStorage.js";
import { Sound } from "./Sound.js";

// Basically just a holder for StringLane instances
export class Fretboard {
  constructor({strings, generalSounds, exactSounds} = {}) {
    this.stringInstances = strings; // [ StringLane instances ]

    this.generalSounds = exactSounds ?? new SoundStorage(
      (sound, value, id) => id === sound,
      (sound, sounds) => {
        sounds[sound] = true;
        return sounds;
      },
      (index, sounds) => {
        sounds[index] = false;
        return sounds;
      }
    ); // Meant for sounds in all octaves

    if(!generalSounds)
      this.generalSounds.sounds = new Array(12).fill(false); // setting up the sounds array of SoundStorage

    this.exactSounds = generalSounds ?? new SoundStorage((sound, value) =>
      sound.toString() === value.toString()); // Meant for Sound instances as those specify the exact octave
  }

  addString(stringInst, index = this.stringInstances.length) {
    if(this.findStringIndex(stringInst) !== -1)
      throw "StringLane already exists in Fretboard";

    this.stringInstances.splice(index, 0, stringInst);

    return this;
  }

  removeStrings() {
    this.stringInstances = [];

    return this;
  }

  removeString(string) {
    const index = this.findStringIndex(string);

    if (index < 0)
      return this;

    this.stringInstances.splice(index, 1);

    return this;
  }

  removeStringByIndex(index) {
    this.removeString(this.stringInstances[index]);

    return this;
  }

  findStringIndex = (string) => this.stringInstances.findIndex(x => x.id === string.id);

  getStringLanesTuning() {
    return new Tuning(this.stringInstances.map(lane => new Sound(lane.sound, lane.octave)));
  }
}
