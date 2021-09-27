import { Sound, sounds } from "../components/Sound.js";
import { Fret } from "../components/Fret.js";
import { DomElem } from "../components/DomElem.js";
import { StringLane } from "../components/StringLane.js";
import { basicTuningElemGenerator } from "./BasicTuningElem.js";

export class BasicStringLane extends StringLane {
  namingConvention = () => {};
  includeZeroFret = true;
  callback = () => {};
  noteDomElemProps = [];
  fretDomElemProps = [];

  // basicLaneProps = { namingConvention, includeZeroFret, callback, noteDomElemProps, fretDomElemProps }
  constructor({ stringLaneProps, domElemProps, basicLaneProps }) {
    super(stringLaneProps);

    Object.assign(this, new DomElem(domElemProps)); // "multiple inheritance"
    Object.assign(this, basicLaneProps);

    this.fretInstances = new Array(this.includeZeroFret ? this.frets + 1 : this.frets)
      .fill(null);
  }

  static init() {
    Object.getOwnPropertyNames( DomElem.prototype ).forEach(method => {
      if(method !== "constructor")
        BasicStringLane.prototype[method] = DomElem.prototype[method];
    });
  }

  static bulkConstructor({ stringLaneProps, domElemProps, basicLaneProps }) {
    return stringLaneProps.map(props => new BasicStringLane({ stringLaneProps: props, domElemProps, basicLaneProps }));
  }

  createLane() {
    for(let i = 0; i < this.fretInstances.length; i++){
      this.fretInstances[i] = new Fret(this.fretDomElemProps, this);
      this.createInTarget({ element: this.fretInstances[i] });
    }

    return this;
  }

  createLaneInTarget(target) {
    this.createLane()
      .createInTarget({ element: this, target });

    return this;
  }

  addTuningElem({ fretboard, generator = basicTuningElemGenerator, create = true }) {
    if(this.tuningElement)
      return this;

    this.tuningElement = generator(this, fretboard);

    if(create)
      this.createInTarget({ element: this.tuningElement, atBeginning: true });

    return this;
  }

  getFretsWithSound(soundIndex) {
    return this.findSoundPlace(soundIndex).map(place => this.fretInstances[place]);
  }

  getFretWithExactSound(sound) {
    return this.fretInstances[this.findSoundOctavePlace(sound)];
  }

  getNoteProps(sound) {
    const index = Number.isInteger(sound) ? sound : sounds.indexOf(sound.sound);
    const soundCSSClass = `n${sounds[index].toLowerCase().replace('#', 's')}`;
    const props = JSON.parse(JSON.stringify(this.noteDomElemProps));
    props.classes.push(soundCSSClass);

    return props;
  }

  // Marks ALL SOUNDS regardless of their octave
  markSound(soundIndex) {
    if(this.fretInstances.some(fret => !fret))
      return this;

    const places = this.findSoundPlace(soundIndex);

    places.forEach(place => {
      const sound = this.getFretSound(place);
      const mark = new DomElem(this.getNoteProps(soundIndex))
        .create(this.namingConvention(sound));
      this.fretInstances[place].noteMark(mark);
    });

    return this;
  }

  markExactSound(sound) {
    if(this.fretInstances.some(fret => !fret))
      return this;

    const place = this.findSoundOctavePlace(sound);

    if(place >= 0 && place <= this.frets)
      this.fretInstances[place].noteMark(new DomElem(this.getNoteProps(sound)).create(this.namingConvention(sound)));

    return this;
  }

  removeMark(soundIndex) {
    this.getFretsWithSound(soundIndex).forEach(fret => fret.empty());

    return this;
  }

  removeExactMark(sound) {
    this.getFretWithExactSound(sound).empty();

    return this;
  }

  isTuningOutdated() {
    return this.soundString() !== this.tuningElement.getTuning().soundString();
  }

  updateTuning() {
    const newSound = this.tuningElement.getTuning();
    return super.updateTuning(newSound);
  }

  reloadFretText() {
    if(this.fretInstances.some(fret => !fret))
      return this;

    this.fretInstances.forEach((fret, index) => {
      if(fret.mark)
        fret.mark.elem.innerText = this.namingConvention(this.getFretSound(index));
    });
  }

  clearAllFrets() {
    this.fretInstances.forEach(fret => fret?.empty());
    return this;
  }
}
