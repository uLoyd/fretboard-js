import { sounds } from "./Sound.js";
import { StringLane } from "./StringLane.js";

export const buttonSoundClick = (fretboardInstance) => {
    return (evt) => {
        const classOn = 'btn-danger';
        const classOff = 'btn-primary';

        fretboardInstance.switchSoundOnOff(evt.target.value);

        evt.target.classList.toggle(classOn);
        evt.target.classList.toggle(classOff);
    }
}

export class Fretboard {
  constructor(obj) {
    const {frets, tuning, container, allowTuningChange, allowOctaveChange, fretsClick, octaveRange} = obj;

    this.frets = frets;
    this.stringInstances = [];
    this.domElement = container;
    this.currentScale = null;
    this.currentSounds = new Array(12).fill(false); // Meant for sounds in all octaves
    this.currentExactSounds = []; // Meant for Sound instances as those specify the exact octave
    this.tuning = tuning;
    this.allowTuningChange = !!allowTuningChange;
    this.allowOctaveChange = !!allowOctaveChange;
    this.fretsClick = fretsClick ?? function () {
    }; // just an empty function to replace missing callback
    this.octaveRange = [4]; // 4 is just a random placeholder. If nothing would be passed
                            // here it'd be the only possible option for every "string" to
                            // be in 4th octave indefinitely

    if (octaveRange) {
      this.octaveRange.pop(); // Throws out the default value

      for (let i = octaveRange.min; i <= octaveRange.max; i++)
        this.octaveRange.push(i);
    }

    return this;
  }

  create() {
    this.tuning.forEach(sound => this.addString(sound));

    return this;
  }

  // checkButtons is optional (dom element containing 12 buttons from A to G#).
  // If passed it will mark buttons related to currently displayed sounds from the scale
  updateScaleToTonic(newTonic, checkButtons) {
    this.currentSounds = this.currentScale.shiftToTonic(sounds.indexOf(newTonic));
    this.addSoundMarksOnStrings(checkButtons);
  }

  // checkButtons is optional. If passed it will mark buttons related to currently displayed sounds from the scale
  showScale(libInstance, checkButtons) {
    return (evt) => {
      const scaleTonicSelect = document.getElementById('scaleTon').value;
      this.currentScale = libInstance.findById(evt.target.value);
      this.currentSounds = this.currentScale.shiftToTonic(sounds.indexOf(scaleTonicSelect));
      this.addSoundMarksOnStrings(checkButtons);
    }
  }

  addCurrentSound(soundIndex) {
    this.currentExactSounds.filter(x => x.sound === sounds[soundIndex]).forEach(sound => this.removeCurrentExactSound(sound));
    this.currentSounds[soundIndex] = true;
    return this;
  }

  removeCurrentSound(soundIndex) {
    this.currentExactSounds.filter(x => x.sound === sounds[soundIndex]).forEach(sound => this.removeCurrentExactSound(sound));
    this.currentSounds[soundIndex] = false;
    return this;
  }

  switchCurrentSound(soundIndex) {
    this.currentSounds[soundIndex] ? this.removeCurrentSound(soundIndex) : this.addCurrentSound(soundIndex);
    return this;
  }

  findCurrentExactSound = sound => this.currentExactSounds.find(x => x.toString() === sound.toString());

  findCurrentExactSoundIndex = sound => this.currentExactSounds.findIndex(x => x.toString() === sound.toString());

  // Sound's supposed to be Sound instance
  addCurrentExactSound(sound) {
    const foundSound = this.findCurrentExactSound(sound);

    if (!foundSound)
      this.currentExactSounds.push(sound);

    return this;
  }

  removeCurrentExactSound(sound) {
    const foundSound = this.findCurrentExactSoundIndex(sound);

    if (foundSound !== -1)
      this.currentExactSounds.splice(foundSound, 1);

    return this;
  }

  // Removes "sound" both from general sound array (currentSounds) and exact sound array (currentExactSounds)
  // based on soundIndex. It will remove ALL instances of sound regardless of octave
  removeSoundAll(soundIndex) {
    this.removeCurrentSound(soundIndex);

    const exacts = this.currentExactSounds.filter(x => x.sound === sounds[soundIndex]);
    exacts.forEach(sound => this.removeCurrentExactSound(sound));

    return this;
  }

  switchCurrentExactSound(sound) {
    const foundSound = this.findCurrentExactSound(sound);

    return foundSound ?
      this.removeCurrentExactSound(sound) :
      this.addCurrentExactSound(sound);
  }

  addExactSoundMarksOnStrings(sound) {
    this.stringInstances.forEach((string) => {
      string.findSoundOctavePlace(sound);
    });

    return this;
  }

  // Creates "marks" of sounds on corresponding frets. Shows the scale on fretboard in short.
  // Adds sound marks for EVERY sound on ALL strings!
  addSoundMarksOnStrings(checkButtons) {
    this.stringInstances.forEach(string => this.addSoundMarksOnString(string));

    if (checkButtons)
      this.checkSoundButtonClasses(checkButtons);
    else
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

    this.currentSounds.forEach((sound, index) => {
      if (sound)
        string.markSound(index);
    });

    this.currentExactSounds.forEach(sound => string.markExactSound(sound));

    return this;
  }

  // If buttons representing sounds are present it will toggle the display of them depending
  // on sound it represents is displayed in current scale or not
  checkSoundButtonClasses(checkButtons) {
    let iterator = 0;

    const {classOff, classOn, buttons} = checkButtons;
    buttons.forEach((button) => {
      if (button.tagName === 'BUTTON') {
        const currentSound = this.currentSounds[iterator];

        // split into two ifs to not make a check too long
        if (currentSound && button.classList.contains(classOff)) {
          button.classList.toggle(classOn);
          button.classList.toggle(classOff);
        } else if (!currentSound && button.classList.contains(classOn)) {
          button.classList.toggle(classOn);
          button.classList.toggle(classOff);
        }

        iterator++;
      }
    });

    return this;
  }

  // Iterates through strings adding / removing sound.
  // If sound passed in argument is currently "marked" in current position it will remove it and vice versa
  // --------------------------------
  // It's useful ONLY for sounds that were added globally (on all strings through addSoundMarksOnStrings method)
  // otherwise if let's say sound was added on one specific fret it will remove it
  // from this exact location and add it in all other ones!
  switchSoundOnOff(sound) {
    const index = sounds.indexOf(sound);
    this.currentSounds[index] = !this.currentSounds[index];

    this.stringInstances.forEach(string =>
      this.currentSounds[index] ?
        string.markSound(index) :
        string.removeMark(index)
    );
  }

  // Sound instance of a string appended to the bottom of displayed fretboard
  // Returns stringLane instance
  addString(sound, create = true, addToTuning = false) {
    if (addToTuning)
      this.tuning.push(sound);

    const lane = new StringLane(
      this.frets,
      sound,
      this.allowTuningChange,
      this.octaveRange,
      this.allowOctaveChange,
      this.fretsClick
    );

    if (create)
      lane.create(this.domElement);

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
      this.tuning.splice(index, 1);

    return this;
  }

  // alternative to removeString method in case of using string index from stringInstances array instead of instance itself
  removeStringByIndex = (index, removeDom = true, removeFromTuning = true) =>
    this.removeString(this.stringInstances[index], removeDom, removeFromTuning);
}
