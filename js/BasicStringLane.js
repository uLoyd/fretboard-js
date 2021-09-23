import { Sound, sounds } from "./Sound.js";
import { Fret } from "./Fret.js";
import { DomElem } from "./DomElem.js";
import { StringLane } from "./StringLane.js";

const defaults = {
  namingConvention: (sound) => sound.soundString(),
  fretDomElemProps: { classes: ['col', 'fret_place', 'd-flex', 'justify-content-center'] },
  noteDomElemProps: { classes: ['rounded', 'col', 'p-1', 'fret_mark'] },
  callback: () => {},
  includeZeroFret: true
}

export class BasicStringLane extends StringLane {
  constructor({ stringLaneProps = {}, domElemProps =  { classes: ['row', 'bg-dark', 'fret_lane'] }, basicLaneProps = {} }) {
    super(stringLaneProps);

    let { fretDomElemProps, noteDomElemProps, callback, includeZeroFret, namingConvention } = basicLaneProps;

    Object.assign(this, new DomElem(domElemProps)); // "multiple inheritance"

    this.fretDomElemProps = fretDomElemProps ?? defaults.fretDomElemProps;
    this.noteDomElemProps = noteDomElemProps ?? defaults.noteDomElemProps;
    this.namingConvention = namingConvention ?? defaults.namingConvention;
    this.callback = callback ?? defaults.callback;
    includeZeroFret = includeZeroFret ?? defaults.includeZeroFret;

    this.tuningElement = null;
    this.fretInstances = new Array(includeZeroFret ? this.frets + 1 : this.frets)
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
    this.createLane();
    this.createInTarget({ element: this, target });
    return this;
  }

  addTuningElem(domElem) {
    this.tuningElement = domElem;

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

  getFretSound(index) {
    const dist = this.getDistanceFromNote() + index; // Distance of new sound = ( distance between A4 and this tuning ) + fretIndex
    const octave = Sound.getOctaveFromDistance(dist); // Gets octave of new sound
    const note = sounds[Sound.getNoteFromDistance(dist)]; // Gets symbol of new sound

    return new Sound(note, octave);
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
    this.findSoundPlace(soundIndex)
      .forEach(place => this.fretInstances[place].empty());

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
