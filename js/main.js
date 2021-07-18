import { Fretboard } from "./Fretboard.js";
import { Sound, sounds } from "./Sound.js";

const container = document.getElementById('fretboard');

const fretboardInstance = new Fretboard({
    container: container,
    frets: 12,
    tuning: [
      new Sound('E', 4),
      new Sound('B', 3),
      new Sound('G', 3),
      new Sound('D', 3),
      new Sound('A', 2),
      new Sound('E', 2)
    ],
    allowTuningChange: true,
    // evt - event...
    // lane - StringLane instance
    onTuningChangeEvt: (evt, lane) => {
        fretboardInstance.clearAllFrets()
          .addSoundMarksOnStrings();
    },
    allowOctaveChange: true,
    // evt - event...
    // lane - StringLane instance
    onOctaveChangeEvt: (evt, lane) => {
        fretboardInstance.clearAllFrets()
          .addSoundMarksOnStrings();
    },
    octaveRange: { min: 1, max: 9 },
    // tuning - Sound instance with value of string
    // fretSound - Sound instance with value of sound on a specific clicked fret
    // marked - is the fret currently marked or not (Boolean)
    // evt - event...
    fretsClick: (tuning, fretSound, marked, evt) => {
      fretboardInstance.switchSoundOnOff(fretSound.sound)
        .addSoundMarksOnStrings();
    },
    emptyStringClasses: ['col', 'd-flex', 'justify-content-center', 'empty_string']
  })
  .create()
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
