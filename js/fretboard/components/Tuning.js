import { Sound } from "./Sound.js";

export class ITuning {
  constructor(sounds, name) {
    this.sounds = sounds;
    this.name = name;
    this[name] = true;
  }

  check() {
    throw "This method should be abstract";
  }

  generate() {
    throw "This method should be abstract";
  }

  tuningSteps() {
    const steps = [];
    this.sounds.forEach((sound, index) =>
      steps.push(sound.distanceBetweenNotes(sound, this.sounds[index + 1])));

    steps.pop();

    return steps;
  }
}

export class StandardTuning extends ITuning {
  constructor(sounds, name = "Standard") {
    super(sounds, name);
  }

  check(steps = this.tuningSteps()) {
    const keypos = 1;

    if(steps[keypos] !== 4)
      return false;

    steps.splice(keypos, 1);

    return steps.every(step => step === 5);
  }

  // startSound = top/highest string
  generate({ startSound = new Sound('E', '4'), strings = 6 } = {}){
    const result = [startSound];
    --strings;

    for(let i = 0; i < strings; ++i)
      result.push(Sound.getSoundFromDistance(result[result.length - 1].getDistanceFromNote() - ( i === 1 ? 4 : 5)));

    return result;
  }
}

export class DropTuning extends StandardTuning {
  constructor(sounds, name = "Drop") {
    super(sounds, name);
  }

  check(steps = this.tuningSteps()) {
    const lastNote = steps.pop();

    return lastNote !== 7 ? false : super.check(steps);
  }

  generate({startSound = new Sound('E', '4'), strings = 6} = {}) {
    const result = super.generate({ startSound, strings });
    const keypos = result.length - 1;
    result[keypos] = Sound.getSoundFromDistance(result[keypos].getDistanceFromNote() - 2);

    return result;
  }
}

export class DoubleDropTuning extends ITuning {
  constructor(sounds, name = "DoubleDrop") {
    super(sounds, name);
  }

  check(steps = this.tuningSteps()) { // at least for a 6 string
    const lastNote = steps.pop();
    const firstNote = steps.shift();
    const secondNote = steps.shift();

    if(!steps.every(x => x === 5))
      return false;

    return lastNote === 7 && firstNote === 3 && secondNote === 4;
  }

  generate({startSound = new Sound('E', '4'), strings = 6} = {}) {
    const result = DropTuning.prototype.generate({ startSound, strings });
    const keypos = 0;
    result[keypos] = Sound.getSoundFromDistance(result[keypos].getDistanceFromNote() - 2);

    return result;
  }
}

export class WildcardTuning extends ITuning {
  constructor(sounds, name = "Unknown") {
    super(sounds, name);
  }

  check = () => true;

  generate() {
    throw "Unknown tuning - cannot generate";
  }
}

export class TuningFinder {
  constructor() {
    this.tunings = [];

    for(let i = 0; i < arguments.length; ++i)
      this.registerTuning(arguments[i]);
  }

  registerTuning(tuning) {
    if(!(new tuning() instanceof ITuning))
      throw "Tuning class passed to TuningFinder doesn't extend ITuning";

    this.tunings.push(tuning);
  }

  removeTuning(tuning) {
    this.tunings = this.tunings.filter(check => tuning !== check);

    return this;
  }

  find(sounds) {
    const result = this.tunings.find(tuning => new tuning(sounds).check());

    return result ? new result(sounds) : false;
  }
}

export const defaultTuningFinder = new TuningFinder(StandardTuning, DropTuning, DoubleDropTuning, WildcardTuning);
