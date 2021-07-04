import { Fretboard, Sound } from "./fretboardModules.js";
const container = document.getElementById('fretboard');
const fretboardInstance = new Fretboard(
  container,
  12,
  [
    new Sound('E', 4),
    new Sound('B', 3),
    new Sound('G', 3),
    new Sound('D', 3),
    new Sound('A', 2),
    new Sound('E', 2)
  ],
  true,
  { min: 1, max: 9 },
  true
)
  .create()
  .addCurrentSound(0)
  .addCurrentSound(3)
  .addCurrentExactSound(new Sound('B', 4))
  .addCurrentExactSound(new Sound('F#', 3))
  .addSoundMarksOnStrings();




