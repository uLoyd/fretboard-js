import { Fretboard, sounds } from "./fretboardModules.js";
import { Sound } from "./Sound.js";

const container = document.getElementById('fretboard');

const fretboardInstance = new Fretboard({
    container: container,
    frets: 12,
    tuning: [
      new Sound('E', 4),
      new Sound('G', 3),
      new Sound('D', 3),
      new Sound('A', 2),
      new Sound('B', 3),
      new Sound('E', 2)
    ],
    allowTuningChange: true,
    allowOctaveChange: true,
    octaveRange: { min: 1, max: 9 },
    // tuning - Sound instance with value of string
    // fretSound - Sound instance with value of sound on specific clicked fret
    // marked - is the mark present on fret or not (Boolean)
    // evt - event...
    fretsClick: (tuning, fretSound, marked, evt) => {
      fretboardInstance.switchCurrentSound(sounds.indexOf(fretSound.sound))
        .addSoundMarksOnStrings();
    }
  })
  .create()
  .addCurrentSound(0)
  .addCurrentSound(3)
  .addCurrentExactSound(new Sound('B', 4))
  .addCurrentExactSound(new Sound('F#', 3))
  .addSoundMarksOnStrings();




