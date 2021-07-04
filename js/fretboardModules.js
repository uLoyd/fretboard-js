import { createDomElement } from "./utils.js";

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

export const optionSelect = (selected, classes, options) => {
    const select = createDomElement('select', classes instanceof Array ? classes : ['col'])

    options.forEach((curOption) => {
        const option = createDomElement('option', [], curOption);
        option.value = sounds.indexOf(curOption);

        if(curOption === selected)
            option.selected = true;

        select.appendChild(option);
    });

    return select;
}

export class Sound {
  constructor(soundSymbol, octave) {
    this.sound = soundSymbol;
    this.octave = octave;
  }

  // Distance relative to A4 (arguments defaults to "this" object)
  getDistanceFromNote(note = this.sound, octave = this.octave) {
    const basePos = sounds.indexOf(note);
    const multiplyOctave = octave - 4; // minus 4 because we're counting from A4
    let pos = 12 * multiplyOctave + basePos;
    if(basePos > 2) pos -= 12;         // offset made because in music the scale starts at C not A
    return pos;
  }

  // Distance relative to A4 - returns only the sound symbol without the octave
  getNoteFromDistance(step) {
    let id = (step > 11 || step < -11 ? step % 12 : step);
    id = (id < 0 ? 12 + id : id);

    return Math.round(id);
  }

  // Distance relative to A4
  getFrequencyFromDistance(distance = this.getDistanceFromNote()) {
    return A4 * Math.pow(2, distance / 12); // Returns a perfect frequency of note x steps from A4
  }

  // Distance relative to A4
  getOctaveFromDistance(distance) {
    let octaves = 4;

    while(true){
      if(distance < -11){     // Checking if offset is needed as scale starts at C and not A
        --octaves;
        distance += 12;
      }
      else if(distance > 11){ // Checking if offset is needed as scale starts at C and not A
        ++octaves;
        distance -= 12;
      }
      else
        break;
    }

    if(distance < -9) octaves--;
    if(distance > 2) octaves++;
    return octaves;
  }

  // arguments are supposed to be instances of Sound class
  distanceBetweenNotes(sound1 = new Sound('A', 4), sound2 = this) {
    const dist1 = this.getDistanceFromNote(sound1.sound, sound1.octave);
    const dist2 = this.getDistanceFromNote(sound2.sound, sound2.octave);

    return dist1 - dist2;
  }

  toString = () => `${this.sound}${this.octave}`;
}

export class ScaleLib{
    constructor(scales) {
        this.scales = [];

        if(scales)
            scales.forEach(scale => this.scales.push(new Scale(scale)));

        return this;
    }

    createAllScaleElements(target){
        this.scales.forEach(scale => scale.createDomElement(target));

        return this;
    }

    findById(id) {
        return this.scales.find(scale => scale.id === id);
    }
}

export class Scale{
    constructor(data) {
        this.id = data['Scale.id'] ?? data.id;

        this.sounds = data['Scale.sounds'] ?
            data['Scale.sounds'].split('').map(x => x === '1') :
            data.scale ?? data.sounds?.split('').map(x => x === '1');

        this.name = data['Scale.name'] ?? data.name;
        this.tonic = data['Scale.tonic'] ?? data.tonic;

        return this;
    }

    createDomElement(target) {
        const elem = createDomElement('option', null, this.name);
        elem.value = this.id;
        target.appendChild(elem);

        return elem;
    }

    shiftToTonic(targetTonic) {
        const diff = this.tonic - targetTonic;
        const arrCopy = [...this.sounds];

        if(diff === 0)
            return arrCopy;

        return arrCopy.splice(diff, arrCopy.length - diff).concat(arrCopy);
    }

    async saveNewScale(url) {
        const rawResponse = await fetch(url, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                scale: this.sounds,
                name: this.name,
                tonic: this.tonic
            })
        });

        const response = await rawResponse;
        const jsonResponse = await response.json();

        return { response: response, json: jsonResponse }
    }
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
    constructor() {
        this.domElement = null;
        this.mark = null;

        return this;
    }

    create(target) {
        this.domElement = createDomElement('div', ['col', 'fret_place', 'd-flex', 'justify-content-center']);
        target.appendChild(this.domElement);

        return this;
    }

    noteMark(note) {
        this.mark = note;
        this.domElement.appendChild(this.mark.domElement);

        return this;
    }

    clear(){
        if(!this.mark)
            return;

        this.domElement.removeChild(this.mark.domElement);
        this.mark = null;
    }
}

export class StringLane {
    constructor(frets, tuning, tuningChange, octaveRange, octaveChange) {
        this.frets = frets;
        this.tuning = tuning;
        this.tuningElement = null;
        this.lane = null;
        this.tuningChange = tuningChange;
        this.fretInstances = [];
        this.octaveRange = octaveRange;
        this.octaveChange = octaveChange;

        return this;
    }

    create(target) {
        this.lane = createDomElement('div', ['row', 'bg-dark', 'fret_lane']);
        target.appendChild(this.lane);

        this.tuningElement = this.tuningChange ? optionSelect(this.tuning.sound, [], sounds) :
            createDomElement('div', ['col', 'bg-success', 'fixed_tuning'], this.tuning.sound);
        this.lane.appendChild(this.tuningElement);
        this.tuningElement.addEventListener('change', this.updateTuning);

        this.octaveElement = this.octaveChange ? optionSelect(this.tuning.octave, [], this.octaveRange) :
            createDomElement('div', ['col', 'bg-info', 'fixed_octave'], this.tuning.octave);
        this.lane.appendChild(this.octaveElement);

        // +1 because of displaying empty string as fret as well
        const fretsDisplay = this.frets + 1;

        for(let i = 0; i < fretsDisplay; i++)
            this.fretInstances.push(new Fret().create(this.lane));

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
            const octave = this.tuning.getOctaveFromDistance(dist); // Gets octave of new sound
            const note = sounds[this.tuning.getNoteFromDistance(dist)]; // Gets symbol of new sound
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
    constructor(container, frets, tuning, allowTuningChange, octaveRange, allowOctaveChange){
        this.frets = frets;
        this.strings = tuning.length;
        this.stringInstances = [];
        this.domElement = container;
        this.currentScale = null;
        this.currentSounds = new Array(12).fill(false); // Meant for sounds in all octaves
        this.currentExactSounds = []; // Meant for Sound instances as those specify the exact octave
        this.tuning = tuning;
        this.allowTuningChange = allowTuningChange;
        this.allowOctaveChange = allowOctaveChange;
        this.octaveRange = [4]; // 4 is just a random placeholder. If nothing would be passed
                                // here it'd be the only possible option for every "string" to
                                // be in 4th octave indefinitely

        if(octaveRange){
          this.octaveRange.pop(); // Throws out the default value

          for(let i = octaveRange.min; i <= octaveRange.max; i++)
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
                  this.allowOctaveChange
                ).create(this.domElement)
            );

        return this;
    }

    // checkButtons is optional. If passed it will mark buttons related to currently displayed sounds from the scale
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
      this.currentSounds[soundIndex] = true;
      return this;
    }

    removeCurrentSound(soundIndex) {
      this.currentSounds[soundIndex] = false;
      return this;
    }

    switchCurrentSound(soundIndex) {
      this.currentSounds[soundIndex] = !this.currentSounds[soundIndex];
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
        this.stringInstances.forEach((string) => {
            string.clearAllFrets();

            this.currentSounds.forEach((sound, index) => {
                if (sound)
                    string.markSound(index);
            });

            this.currentExactSounds.forEach(sound => string.markExactSound(sound));
        });

        if(checkButtons)
            this.checkSoundButtonClasses(checkButtons);
        else
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
