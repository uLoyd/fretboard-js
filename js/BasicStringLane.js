import { Sound, sounds } from "./Sound.js";
import { Fret } from "./Fret.js";
import { DomElem } from "./DomElem.js";
import { StringLane } from "./StringLane.js";

export class BasicStringLane extends StringLane {
  constructor(StringLaneProps, DomElemProps, { fretDomElemProps, noteDomElemProps, callback } = {}) {
    super(StringLaneProps);
    Object.assign(this, new DomElem(DomElemProps ?? { classes: ['row', 'bg-dark', 'fret_lane'] })); // "multiple inheritance"

    this.fretInstances = new Array(this.frets);
    this.callback = callback;

    this.fretDomElemProps = fretDomElemProps ?? { classes: ['col', 'fret_place', 'd-flex', 'justify-content-center'] };
    this.noteDomElemProps = noteDomElemProps ?? { classes: ['col', 'fret_place', 'd-flex', 'justify-content-center'] };

    this.tuningElement = null;
  }

  static init() {
    Object.getOwnPropertyNames( DomElem.prototype ).forEach(method => {
      if(method !== "constructor")
        BasicStringLane.prototype[method] = DomElem.prototype[method];
    });
  }

  static bulkConstructor(StringLaneProps, DomElemProps, BasicLaneProps) {
    return StringLaneProps.map(props => new BasicStringLane(props, DomElemProps, BasicLaneProps));
  }

  createLane() {
    this.create();

    // "less than equal" cause 12 frets = < 0, 1, 2 ... 12 >
    for(let i = 0; i <= this.frets; i++){
      const fret = new Fret(this.fretDomElemProps, this.callback);
      this.createInTarget({ element: fret });
      this.fretInstances.push(fret);
    }

    return this;
  }

  createLaneInTarget(target) {
    this.createLane();
    this.createInTarget({ element: this, target });
    return this;
  }

  // no creation specified, freedom of implementation :v
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

  // Marks ALL SOUNDS regardless of their octave
  markSound(soundIndex) {
    const places = this.findSoundPlace(soundIndex);

    places.forEach(place => {
      const dist = this.getDistanceFromNote() + place; // Distance of new sound = ( distance between A4 and this tuning ) + fretIndex
      const octave = Sound.getOctaveFromDistance(dist); // Gets octave of new sound
      const note = sounds[Sound.getNoteFromDistance(dist)]; // Gets symbol of new sound
      const mark = new DomElem(this.noteDomElemProps).create(note.toUpperCase() + octave);
      this.fretInstances[place].noteMark(mark);
    });

    return this;
  }

  markExactSound(sound, namingConvention) {
    const place = this.findSoundOctavePlace(sound);

    if(place >= 0 && place <= this.frets)
      this.fretInstances[place].noteMark(new DomElem(this.noteDomElemProps).create(sound.toString().toUpperCase()));

    return this;
  }

  removeMark(soundIndex) {
    this.findSoundPlace(soundIndex)
      .forEach(place => this.fretInstances[place].empty());

    return this;
  }

  clearAllFrets() {
    this.fretInstances.forEach(fret => fret.empty());
    return this;
  }
}
