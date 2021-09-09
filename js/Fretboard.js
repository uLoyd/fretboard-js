import { Sound, sounds } from "./Sound.js";
import { StringLane } from "./StringLane.js";
import { Tuning } from "./Tuning.js";
import { SoundStorage } from "./SoundStorage.js";
import { createDomElement } from "./utils.js";

export class Fretboard {
  constructor(obj) {
    const {
      frets,
      tuning,
      container,
      onTuningChangeEvt,
      onOctaveChangeEvt,
      fretsClick,
      octaveRange,
      stringLaneElemClasses,
      fretElemClasses,
      noteElemClasses,
      emptyStringClasses,
      namingConvention
    } = obj;

    this.frets = frets;
    this.stringInstances = [];
    this.domElement = container;
    //this.currentScale = null;
    //this.currentSounds = new Array(12).fill(false);

    this.currentSounds = new SoundStorage(
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
    this.currentSounds.sounds = new Array(12).fill(false); // setting up the sounds array of SoundStorage

    //this.currentExactSounds = []; // Meant for Sound instances as those specify the exact octave
    this.currentExactSounds = new SoundStorage((sound, value) =>
      sound.toString() === value.toString()); // Meant for Sound instances as those specify the exact octave

    this.tuning = new Tuning(tuning);
    this.allowTuningChange = !!onTuningChangeEvt;
    this.onTuningChangeEvt = onTuningChangeEvt ?? function () {}; // just an empty function to replace missing callback
    this.allowOctaveChange = !!onOctaveChangeEvt;
    this.onOctaveChangeEvt = onOctaveChangeEvt ?? function () {}; // just an empty function to replace missing callback
    this.fretsClick = fretsClick ?? function () {}; // just an empty function to replace missing callback
    this.octaveRange = [4]; // 4 is just a random placeholder. If nothing would be passed
                            // here it'd be the only possible option for every "string" to
                            // be in 4th octave indefinitely

    this.stringLaneElemClasses = stringLaneElemClasses;
    this.fretElemClasses = fretElemClasses;
    this.noteElemClasses = noteElemClasses;
    this.emptyStringClasses = emptyStringClasses;
    this.namingConvention = namingConvention;

    if (octaveRange) {
      this.octaveRange.pop(); // Throws out the default value

      for (let i = octaveRange.min; i <= octaveRange.max; i++)
        this.octaveRange.push(i);
    }

    return this;
  }

  create(marks) {
    this.fretboardElement = createDomElement('div');
    this.domElement.appendChild(this.fretboardElement);

    this.tuning.sounds.forEach(sound => this.addString(sound));

    if(!marks)
      return this;

    // lane used for representing fret numbers
    const lane = new StringLane({
      frets: this.frets,
      tuningChange: this.allowTuningChange,
      octaveChange: this.allowOctaveChange,
      tuning: new Sound(null, null),
      octaveRange: [1],
      fretElemClasses: ['col', 'd-flex', 'justify-content-center'],
      emptyStringClasses: this.emptyStringClasses ?? ['col', 'd-flex', 'justify-content-center']
    });
    lane.create(this.domElement);
    lane.tuningElement.style.visibility = 'hidden';
    lane.octaveElement.style.visibility = 'hidden';

    marks.forEach(mark => lane.fretInstances[mark].domElement.innerText = mark);

    return this;
  }

  // Sound instance of strings tuning that will get appended to the bottom of displayed fretboard
  // Returns stringLane instance
  addString(sound, create = true, addToTuning = false) {
    if (addToTuning)
      this.tuning.sounds.push(sound);

    const {
      frets,
      allowTuningChange,
      octaveRange,
      allowOctaveChange,
      onTuningChangeEvt,
      onOctaveChangeEvt,
      fretsClick,
      stringLaneElemClasses,
      fretElemClasses,
      noteElemClasses
    } = this;

    const lane = new StringLane({
        frets,
        tuning: sound,
        tuningChange: allowTuningChange,
        octaveRange,
        octaveChange: allowOctaveChange,
        onTuningChangeEvt,
        onOctaveChangeEvt,
        callback: fretsClick,
        cssClasses: stringLaneElemClasses ?? {},
        fretElemClasses,
        noteElemClasses
    });

    if (create)
      lane.create(this.fretboardElement);

    this.stringInstances.push(lane);

    return lane;
  }

  removeFretboard() {
    this.stringInstances = [];
    this.domElement.innerHTML = '';

    return this;
  }

  // string - stringLane instance
  // returns stringLane instance index in stringInstances array
  findStringIndex = (string) => this.stringInstances.findIndex(x => x.id === string.id);

  // string - stringLane instance
  removeString(string, removeDom = true, removeFromTuning = true) {
    const index = this.findStringIndex(string);

    if (index < 0)
      return this;

    if (removeDom)
      string.remove();

    this.stringInstances.splice(index, 1);

    if (removeFromTuning)
      this.tuning.sounds.splice(index, 1);

    return this;
  }

  // alternative to removeString method in case of using string index from stringInstances array instead of instance itself
  removeStringByIndex = (index, removeDom = true, removeFromTuning = true) =>
    this.removeString(this.stringInstances[index], removeDom, removeFromTuning);

  addExactSoundMarksOnStrings(sound, addToCurrent = true) {
    if(addToCurrent)
      this.currentExactSounds.add(sound);

    this.stringInstances.forEach((string) => {
      string.findSoundOctavePlace(sound);
    });

    return this;
  }

  // Creates "marks" of sounds on corresponding frets. Shows the scale on fretboard in short.
  // Adds sound marks for EVERY sound on ALL strings!
  addSoundMarksOnStrings() {
    console.log(this.currentExactSounds.sounds);
    this.stringInstances.forEach(string => this.addSoundMarksOnString(string));

    return this;
  }

  // Index of a string same as in the "tuning" array passed to Fretboard class constructor
  // StringLane instance is passed to addSoundMarksOnString which then returns Fretboard instance
  addSoundMarksOnStringIndex(stringIndex) {
    const string = this.stringInstances[stringIndex];
    return this.addSoundMarksOnString(string);
  }

  // Adds sound marks on one specific string. "string" parameter is a StringLane instance
  addSoundMarksOnString(string) {
    string.clearAllFrets();

    this.currentSounds.sounds.forEach((sound, index) => {
      if (sound)
        string.markSound(index, this.namingConvention);
    });

    this.currentExactSounds.sounds.forEach(sound => string.markExactSound(sound, this.namingConvention));

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
