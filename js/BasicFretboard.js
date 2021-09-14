import { Tuning , Fretboard, DomElem } from "./index.js";

export class BasicFretboard extends Fretboard {
  constructor({ stringLanes, DomElemProps = {}, generalSounds, exactSounds}) {
    super({ strings: stringLanes, generalSounds, exactSounds }); // Basic String Lane instances
    Object.assign(this, new DomElem(DomElemProps)); // "Multiple inheritance"
  }

  static init() {
    Object.getOwnPropertyNames( DomElem.prototype ).forEach(method => {
      if(method !== "constructor")
        BasicFretboard.prototype[method] = DomElem.prototype[method];
    });
  }

  createStringLanes(stringLanes = this.stringInstances) {
    stringLanes.forEach(lane => lane.createLaneInTarget(this.elem));

    return this;
  }

  createStringAtIndex(string, index) {
    const newString = string.createLane(this.elem);
    this.addString(newString, index);

    if(index === this.stringInstances.length)
      this.createInTarget({ element: newString });

    else if(index === 0)
      this.createInTarget({ element: string.createLane(), atBeginning: true });

    else
      this.createBefore({ element: newString, before: this.stringInstances[index] })


    return this;
  }

  addTuningElements(elements, create = true) {
    this.stringInstances.forEach((lane, index) => {
      lane.addTuningElem(elements[index]);

      if(create)
        lane.tuningElement.createElem();
    });

    return this;
  }

  removeFretboard() {
    this.removeStrings()
      .remove();

    return this;
  }

  removeString(string, removeDom = true) {
    if(this.findStringIndex(string) < 0)
      throw "String does not exist";

    if (removeDom)
      string.remove();

    super.removeString(string);

    return this;
  }

  // alternative to removeString method in case of using string index from stringInstances array instead of instance itself
  removeStringByIndex = (index, removeDom = true, removeFromTuning = true) =>
    this.removeString(this.stringInstances[index], removeDom, removeFromTuning);

  // Creates "marks" of sounds on corresponding frets. Shows the scale on fretboard in short.
  // Adds sound marks for EVERY sound on ALL strings!
  addSoundMarksOnStrings() {
    this.stringInstances.forEach(string => this.addSoundMarksOnString(string));

    return this;
  }

  // Adds sound marks on one specific string. "string" parameter is a StringLane instance
  addSoundMarksOnString(string) {
    string.clearAllFrets();

    this.generalSounds.sounds.forEach((sound, index) => {
      if (sound)
        string.markSound(index, this.namingConvention);
    });

    this.exactSounds.sounds.forEach(sound => string.markExactSound(sound));

    return this;
  }

  changeNamingConvention(convention, reload = true) {
    if(this.namingConvention === convention)
      return this;

    this.namingConvention = convention;

    if(reload)
      this.clearAllFrets()
        .addSoundMarksOnStrings();

    return this;
  }

  getStringLanesTuning() {
    return new Tuning(this.stringInstances.map(lane => lane.currentTuningValue()));
  }

  clearAllFrets() {
    this.stringInstances.forEach(string => string.clearAllFrets());
    return this;
  }
}
