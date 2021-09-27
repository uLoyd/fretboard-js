export class BasicFretboardBuilder {
  constructor(FretboardClass, ...args) {
    FretboardClass.init();
    this.fretboard = new FretboardClass(...args);
  }

  setTuning(TuningClass, startSound, strings) {
    this.tuning = new TuningClass().generate({ startSound, strings});
    return this;
  }

  generate(generator, ...args) {
    this.fretboard.stringInstances = this.tuning.map(sound => generator(sound, this.fretboard, ...args));
    return this;
  }

  get() {
    return this.fretboard;
  }
}
