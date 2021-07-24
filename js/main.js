import { Fretboard } from "./Fretboard.js";
import { Sound, sounds } from "./Sound.js";
import { Tuning } from "./Tuning.js";
const container = document.getElementById('fretboard');

const fretboardInstance = new Fretboard({
    container,
    frets: 12,
    tuning: [
      new Sound('E', 4),
      new Sound('B', 3),
      new Sound('G', 3),
      new Sound('D', 3),
      new Sound('A', 2),
      new Sound('E', 2)
    ],
    // evt - event...
    // lane - StringLane instance
    onTuningChangeEvt: (evt, lane) => fretboardInstance.addSoundMarksOnString(lane),
    // evt - event...
    // lane - StringLane instance
    onOctaveChangeEvt: (evt, lane) => fretboardInstance.addSoundMarksOnString(lane),
    octaveRange: { min: 1, max: 9 },
    // tuning - Sound instance with value of string
    // fretSound - Sound instance with value of sound on a specific clicked fret
    // marked - is the fret currently marked or not (Boolean)
    // evt - event...
    fretsClick: (tuning, fretSound, marked, evt) => {
      const soundIndex = sounds.indexOf(fretSound.sound);
      if(marked)
        fretboardInstance.removeCurrentSound(soundIndex)
          .addSoundMarksOnStrings();
      else
        fretboardInstance.addCurrentSound(soundIndex)
          .addSoundMarksOnStrings();
    },
    emptyStringClasses: ['col', 'd-flex', 'justify-content-center', 'empty_string']
  })
  .create([0, 3, 5, 7, 9, 12])
  .addCurrentSound(0)
  .addCurrentSound(3)
  .addCurrentExactSound(new Sound('B', 4))
  .addCurrentExactSound(new Sound('F#', 3))
  .addSoundMarksOnStrings();

const addStringButton = document.getElementById('addStringButton');
addStringButton.addEventListener('click', () => {
  const newString = fretboardInstance.addString(new Sound('A', 1));
  fretboardInstance.addSoundMarksOnString(newString);
});

const removeStringButton = document.getElementById('removeStringButton');
removeStringButton.addEventListener('click', () => {
  const index = fretboardInstance.stringInstances.length - 1;
  fretboardInstance.removeStringByIndex(index);
});

const noteSharp = document.getElementById('noteSharp');
noteSharp.addEventListener('click', () => fretboardInstance.changeNamingConvention(sound =>
  sound.sound + sound.octave));

const noteFlat = document.getElementById('noteFlat');
noteFlat.addEventListener('click', () => fretboardInstance.changeNamingConvention((sound) =>
  (sound.flatNote ?? sound.sound) + (sound.flatOctave ?? sound.octave)
));

const noteFrequency = document.getElementById('noteFrequency');
noteFrequency.addEventListener('click', () => fretboardInstance.changeNamingConvention(sound =>
  `${ sound.getFrequencyFromDistance().toFixed(0) }Hz`));

const standardTuning = new Tuning([
  new Sound('E', 4),
  new Sound('B', 3),
  new Sound('G', 3),
  new Sound('D', 3),
  new Sound('A', 2),
  new Sound('E', 2)
]);

const dropTuning = new Tuning([
  new Sound('E', 4),
  new Sound('B', 3),
  new Sound('G', 3),
  new Sound('D', 3),
  new Sound('A', 2),
  new Sound('D', 2)
]);

const doubleDropTuning = new Tuning([
  new Sound('B', 3),
  new Sound('G#', 3),
  new Sound('E', 3),
  new Sound('B', 2),
  new Sound('F#', 2),
  new Sound('B', 1)
]);

console.assert(standardTuning.isStandard() === true);
console.assert(standardTuning.isDrop() === false);
console.assert(standardTuning.isDoubleDrop() === false);
console.assert(dropTuning.isStandard() === false);
console.assert(dropTuning.isDrop() === true);
console.assert(dropTuning.isDoubleDrop() === false);
console.assert(doubleDropTuning.isStandard() === false);
console.assert(doubleDropTuning.isDrop() === false);
console.assert(doubleDropTuning.isDoubleDrop() === true);
