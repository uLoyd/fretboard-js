import { Sound, sounds } from "./Sound.js";
import { Fret } from "./Fret.js";
import { DomElem } from "./DomElem.js";
import { StringLane } from "./StringLane.js";

export class BasicStringLane extends StringLane {
  constructor({ stringLaneProps = {}, domElemProps, basicLaneProps = {} }) {
    super(stringLaneProps);

    const { fretDomElemProps, noteDomElemProps, callback } = basicLaneProps;
    Object.assign(this, new DomElem(domElemProps ?? { classes: ['row', 'bg-dark', 'fret_lane'] })); // "multiple inheritance"

    this.fretInstances = new Array(this.frets);
    this.callback = callback;

    this.fretDomElemProps = fretDomElemProps ?? { classes: ['col', 'fret_place', 'd-flex', 'justify-content-center'] };
    this.noteDomElemProps = noteDomElemProps ?? { classes: ['rounded', 'col', 'p-1', 'fret_mark'] };

    this.tuningElement = null;
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
    this.create();

    // "less than equal" cause 12 frets = < 0, 1, 2 ... 12 >
    for(let i = 0; i <= this.frets; i++){
      const fret = new Fret(this.fretDomElemProps, this);
      this.createInTarget({ element: fret });
      this.fretInstances[i] = fret;
    }

    return this;
  }

  createLaneInTarget(target) {
    this.createLane();
    this.createInTarget({ element: this, target });
    return this;
  }

  addTuningElem(DomElem) {
    this.tuningElement = DomElem;

    return this;
  }

  getFretsWithSound(soundIndex) {
    return this.findSoundPlace(soundIndex).map(place => this.fretInstances[place]);
  }

  getFretsWithExactSound(sound) {
    return this.fretInstances[this.findSoundOctavePlace(sound)];
  }

  getNoteProps(sound) {
    const index = Number.isInteger(sound) ? sound : sounds.indexOf(sound.sound);
    const soundCSSclass = `n${sounds[index].toLowerCase().replace('#', 's')}`;
    const props = JSON.parse(JSON.stringify(this.noteDomElemProps));
    props.classes.push(soundCSSclass);

    return props;
  }

  // Marks ALL SOUNDS regardless of their octave
  markSound(soundIndex) {
    const places = this.findSoundPlace(soundIndex);

    places.forEach(place => {
      const dist = this.getDistanceFromNote() + place; // Distance of new sound = ( distance between A4 and this tuning ) + fretIndex
      const octave = Sound.getOctaveFromDistance(dist); // Gets octave of new sound
      const note = sounds[Sound.getNoteFromDistance(dist)]; // Gets symbol of new sound
      const mark = new DomElem(this.getNoteProps(soundIndex)).create(note.toUpperCase() + octave);
      this.fretInstances[place].noteMark(mark);
    });

    return this;
  }

  markExactSound(sound) {
    const place = this.findSoundOctavePlace(sound);

    if(place >= 0 && place <= this.frets)
      this.fretInstances[place].noteMark(new DomElem(this.getNoteProps(sound)).create(sound.toString().toUpperCase()));

    return this;
  }

  removeMark(soundIndex) {
    this.findSoundPlace(soundIndex)
      .forEach(place => this.fretInstances[place].empty());

    return this;
  }

  isTuningOutdated() {
    return this.toString() !== this.tuningElement.getTuning().toString();
  }

  clearAllFrets() {
    this.fretInstances.forEach(fret => fret.empty());
    return this;
  }
}
