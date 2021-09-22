import { Sound, sounds } from "./Sound.js";
import { Fret } from "./Fret.js";
import { DomElem } from "./DomElem.js";
import { StringLane } from "./StringLane.js";

export class BasicStringLane extends StringLane {
  constructor({ stringLaneProps = {}, domElemProps =  { classes: ['row', 'bg-dark', 'fret_lane'] }, basicLaneProps = {} }) {
    super(stringLaneProps);

    const {
      fretDomElemProps = { classes: ['col', 'fret_place', 'd-flex', 'justify-content-center'] },
      noteDomElemProps = { classes: ['rounded', 'col', 'p-1', 'fret_mark'] },
      callback,
      includeZeroFret = true
    } = basicLaneProps;

    Object.assign(this, new DomElem(domElemProps)); // "multiple inheritance"

    this.fretDomElemProps = fretDomElemProps;
    this.noteDomElemProps = noteDomElemProps;
    this.tuningElement = null;
    this.fretInstances = new Array(includeZeroFret ? this.frets + 1 : this.frets)
      .fill(null);
    this.callback = callback;
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
    const soundCSSclass = `n${sounds[index].toLowerCase().replace('#', 's')}`;
    const props = JSON.parse(JSON.stringify(this.noteDomElemProps));
    props.classes.push(soundCSSclass);

    return props;
  }

  // just override this to make it display anything else
  namingConvention(sound) {
    return sound.sound.toUpperCase() + sound.octave;
  }

  // Marks ALL SOUNDS regardless of their octave
  markSound(soundIndex) {
    if(this.fretInstances.some(fret => !fret))
      return this;

    const places = this.findSoundPlace(soundIndex);

    places.forEach(place => {
      const dist = this.getDistanceFromNote() + place; // Distance of new sound = ( distance between A4 and this tuning ) + fretIndex
      const octave = Sound.getOctaveFromDistance(dist); // Gets octave of new sound
      const note = sounds[Sound.getNoteFromDistance(dist)]; // Gets symbol of new sound
      const mark = new DomElem(this.getNoteProps(soundIndex)).create(this.namingConvention(new Sound(note, octave)));
      this.fretInstances[place].noteMark(mark);
    });

    return this;
  }

  markExactSound(sound) {
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

  clearAllFrets() {
    this.fretInstances.forEach(fret => fret?.empty());
    return this;
  }
}
