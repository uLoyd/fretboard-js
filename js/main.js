import {
  FlatOctave,
  SharpOctave,
  Frequency, BasicStringLaneBuilder, BasicStringLane, BasicTuningElem
} from "./fretboard";
import { CustomFretboard } from "./CustomFretboard.js";

const container = document.getElementById("fretboard");
const customFretboard = new CustomFretboard().init(container);

// code below only creates dummy string lane which displays given fret numbers
const fretMarkLane = new BasicStringLaneBuilder(BasicStringLane)
  .setDomElemProps({classes: ['row', 'bg-dark', 'fret_lane']})
  .setBasicLaneProps({includeZeroFret: true})
  .setFretDomElemProps({classes: ['col', 'd-flex', 'justify-content-center']})
  .get().createLane();

fretMarkLane.tuningElement = new BasicTuningElem({});
fretMarkLane.createInTarget({
  element: fretMarkLane.tuningElement,
  atBeginning: true
}).createInTarget({target: container, element: fretMarkLane});

fretMarkLane.tuningElement.sound.elem.style.visibility = 'hidden';
fretMarkLane.tuningElement.octave.elem.style.visibility = 'hidden';
[0, 3, 5, 7, 9, 12].forEach(x => fretMarkLane.fretInstances[x].elem.innerText = x);

// button click events
document.getElementById('addStringButton').addEventListener('click', () => customFretboard.addString());

document.getElementById('removeStringButton').addEventListener('click', () => customFretboard.fretboard.removeStringByIndex());

document.getElementById('noteFlat').addEventListener('click', () => customFretboard.changeConvention(FlatOctave));

document.getElementById('noteSharp').addEventListener('click', () => customFretboard.changeConvention(SharpOctave));

document.getElementById('noteFrequency').addEventListener('click', () => customFretboard.changeConvention(Frequency));

document.getElementById('allSounds').addEventListener('click', () => customFretboard.changeSoundAll());

document.getElementById('sameOctave').addEventListener('click', () => customFretboard.changeSoundSameOctave());
