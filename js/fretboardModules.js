import { createDomElement } from "./utils.js";
import { Sound } from "./Sound.js";

export const sounds = ['A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#'];

export const A4 = 440; // Sound A in 4th octave by ISO standard is 440 Hz

export const buttonSoundClick = (fretboardInstance) => {
    return (evt) => {
        const classOn = 'btn-danger';
        const classOff = 'btn-primary';

        fretboardInstance.switchSoundOnOff(evt.target.value);

        evt.target.classList.toggle(classOn);
        evt.target.classList.toggle(classOff);
    }
}

// valueCallback is just a function that returns what value should be assigned to each "option" element
export const optionSelect = (selected, classes, options, valueCallback) => {
    const select = createDomElement('select', classes instanceof Array ? classes : ['col'])

    options.forEach((curOption) => {
        const option = createDomElement('option', [], curOption);
        option.value = valueCallback(curOption);

        if(curOption === selected)
            option.selected = true;

        select.appendChild(option);
    });

    return select;
}

export class Note{
    constructor(sound) {
        this.sound = sound;
        this.domElement = null;

        return this;
    }

    create() {
        if(this.domElement)
          return this;

        const colorClass = `n${this.sound.sound.toLowerCase().replace('#', 's')}`;
        this.domElement = createDomElement(
            'div',
            ['rounded', 'col', 'p-1', 'fret_mark', colorClass],
            this.sound.toString()
        );

        return this;
    }
}

export class Fret{
    constructor(callback) {
        this.domElement = null;
        this.mark = null;
        this.callback = (mark) => {
          return (evt) => {
            evt.stopPropagation();

            const tuning = new Sound(sounds[this.#getStringTuning(evt)], this.#getStringOctave(evt));
            const fret = Array.prototype.indexOf.call(this.domElement.parentNode.children, mark ? evt.target.parentNode : evt.target) - 2;
            const fretSound = Sound.getNoteFromDistance(tuning.getDistanceFromNote() + fret);
            const fretOctave = Sound.getOctaveFromDistance(tuning.getDistanceFromNote() + fret);

            callback(tuning, new Sound(sounds[fretSound], fretOctave), !!this.mark, evt);
          }
        }

        return this;
    }

    create(target) {
        this.domElement = createDomElement('div', ['col', 'fret_place', 'd-flex', 'justify-content-center']);
        this.domElement.addEventListener('click', this.callback());
        target.appendChild(this.domElement);

        return this;
    }

    noteMark(note) {
        this.mark = note;
        this.domElement.appendChild(this.mark.domElement);
        this.mark.domElement.addEventListener('click', this.callback(true));
        return this;
    }

    clear(){
        if(!this.mark)
            return;

        this.domElement.removeChild(this.mark.domElement);
        this.mark = null;
    }

    #getStringTuning = () => this.domElement.parentNode.children[0].value ?? sounds.indexOf(this.domElement.parentNode.children[0].innerText);

    #getStringOctave = () => this.domElement.parentNode.children[1].value ?? parseInt(this.domElement.parentNode.children[1].innerText);
}

export class StringLane {
    constructor(frets, tuning, tuningChange, octaveRange, octaveChange, callback) {
        this.frets = frets;
        this.tuning = tuning;
        this.tuningElement = null;
        this.lane = null;
        this.tuningChange = tuningChange;
        this.fretInstances = [];
        this.octaveRange = octaveRange;
        this.octaveChange = octaveChange;
        this.callback = callback;

        return this;
    }

    create(target) {
        this.lane = createDomElement('div', ['row', 'bg-dark', 'fret_lane']);
        target.appendChild(this.lane);

        this.tuningElement = this.tuningChange ? optionSelect(this.tuning.sound, [], sounds, opt => sounds.indexOf(opt)) :
            createDomElement('div', ['col', 'bg-success', 'fixed_tuning'], this.tuning.sound);
        this.lane.appendChild(this.tuningElement);
        this.tuningElement.addEventListener('change', this.updateTuning);

        this.octaveElement = this.octaveChange ? optionSelect(this.tuning.octave, [], this.octaveRange, opt => opt) :
            createDomElement('div', ['col', 'bg-info', 'fixed_octave'], this.tuning.octave);
        this.lane.appendChild(this.octaveElement);

        // +1 because of displaying empty string as fret as well
        const fretsDisplay = this.frets + 1;

        for(let i = 0; i < fretsDisplay; i++)
            this.fretInstances.push(new Fret(this.callback).create(this.lane));

        return this;
    }

    updateTuning(evt) {
        this.tuning = evt.target.value;
    }

    findSoundPlace(soundIndex) {
        const places = [];
        if(!this.tuning)
            return;

        const currentTuning = sounds.indexOf(this.tuning.sound);
        const diff = currentTuning - soundIndex;
        let currentToPush = diff <= 0 ? Math.abs(diff) : 12 - diff;

        while(this.fretInstances.length > currentToPush){
            places.push(currentToPush);
            currentToPush += 12;
        }

        return places;
    }

    // Sound's supposed to be Sound instance
    findSoundOctavePlace = sound => this.tuning.distanceBetweenNotes(sound);

    // Marks ALL SOUNDS regardless of their octave
    markSound(soundIndex) {
        const places = this.findSoundPlace(soundIndex);

        places.forEach(place => {
            const dist = this.tuning.getDistanceFromNote() + place; // Distance of new sound = ( distance between A4 and this tuning ) + fretIndex
            const octave = Sound.getOctaveFromDistance(dist); // Gets octave of new sound
            const note = sounds[Sound.getNoteFromDistance(dist)]; // Gets symbol of new sound
            const sound = new Sound(note, octave); // Creates new sound
            const mark = new Note(sound).create();
            this.fretInstances[place].noteMark(mark);
        });

        return this;
    }

    markExactSound(sound) {
      const place = this.findSoundOctavePlace(sound);

      if(place >= 0 && place <= this.frets)
        this.fretInstances[place].noteMark(new Note(sound).create());

      return this;
    }

    removeMark(soundIndex) {
        this.findSoundPlace(soundIndex)
            .forEach(place => this.fretInstances[place].clear());

        return this;
    }

    clearAllFrets() {
        this.fretInstances.forEach(fret => fret.clear());
        return this;
    }
}

export class Fretboard{
    constructor(obj) {
        this.frets = obj.frets;
        this.strings = obj.tuning.length;
        this.stringInstances = [];
        this.domElement = obj.container;
        this.currentScale = null;
        this.currentSounds = new Array(12).fill(false); // Meant for sounds in all octaves
        this.currentExactSounds = []; // Meant for Sound instances as those specify the exact octave
        this.tuning = obj.tuning;
        this.allowTuningChange = !!obj.allowTuningChange;
        this.allowOctaveChange = !!obj.allowOctaveChange;
        this.fretsClick = obj.fretsClick ?? function(){}; // just and empty function to replace missing callback
        this.octaveRange = [4]; // 4 is just a random placeholder. If nothing would be passed
                                // here it'd be the only possible option for every "string" to
                                // be in 4th octave indefinitely

        if(obj.octaveRange){
          this.octaveRange.pop(); // Throws out the default value

          for(let i = obj.octaveRange.min; i <= obj.octaveRange.max; i++)
            this.octaveRange.push(i);
        }

        return this;
    }

    create(){
        for(let i = 0; i < this.strings; i++)
            this.stringInstances.push(
                new StringLane(
                  this.frets,
                  this.tuning[i],
                  this.allowTuningChange,
                  this.octaveRange,
                  this.allowOctaveChange,
                  this.fretsClick
                ).create(this.domElement)
            );

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

      if(!foundSound)
        this.currentExactSounds.push(sound);

      return this;
    }

    removeCurrentExactSound(sound) {
      const foundSound = this.findCurrentExactSoundIndex(sound);

      if(foundSound !== -1)
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

    addExactSoundMarksOnStrings(sound){
      this.stringInstances.forEach((string) => {
        string.findSoundOctavePlace(sound);
      });

      return this;
    }

    // Creates "marks" of sounds on corresponding frets. Shows the scale on fretboard in short.
    // Adds sound marks for EVERY sound on ALL strings!
    addSoundMarksOnStrings(checkButtons) {
        this.stringInstances.forEach(string => this.addSoundMarksOnString(string));

        if(checkButtons)
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
            if(button.tagName === 'BUTTON'){
                // split in two ifs to not make a check too long
                if(this.currentSounds[iterator] && button.classList.contains(classOff)){
                    button.classList.toggle(classOn);
                    button.classList.toggle(classOff);
                }
                else if(!this.currentSounds[iterator] && button.classList.contains(classOn)){
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
}
