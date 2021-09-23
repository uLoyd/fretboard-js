import { BasicStringLane, BasicFretboard, BasicTuningElem } from "./index.js";

const container = document.getElementById("fretboard");

let currentConvention = (sound) => sound.soundString();

BasicFretboard.init();
BasicStringLane.init();

const stringLaneProps = [
  { sound: 'E', octave: 4 },
  { sound: 'B', octave: 3 },
  { sound: 'G', octave: 3 },
  { sound: 'D', octave: 3 },
  { sound: 'A', octave: 2 },
  { sound: 'E', octave: 2 }
];

const fretClick = (fret, lane, marked, evt) => {
  fretboard.generalSounds.reverse(lane.findSoundByPlace(fret).soundIndex);
  //fretboard.exactSounds.reverse(lane.findSoundByPlace(fret));
  fretboard.addSoundMarksOnStrings();
}

const basicLaneProps = () => {
  return {
    callback: fretClick ,
    namingConvention: currentConvention
  }
}

const stringLanes = BasicStringLane.bulkConstructor({
  stringLaneProps,
  basicLaneProps: basicLaneProps()
});

const tuningChange = (evt, tuning) => {
  tuning.selected = evt.target.value;
  fretboard.selfCheck();
}

const tuningElementGenerator = (stringLane, create = true) => {
  const tuning = new BasicTuningElem({
    stringLane: stringLane,
    onchange: tuningChange
  });

  return create ? tuning.createElem() : tuning;
}

stringLanes.forEach(lane => {
  const tuning = tuningElementGenerator(lane);

  lane.addTuningElem(tuning)
    .createInTarget({ element: lane.tuningElement, atBeginning: true});
});

const fretboard = new BasicFretboard({ stringLanes });
fretboard.createInTarget({ element: fretboard, atBeginning: true, target: container })
  .createStringLanes();

document.getElementById('addStringButton').addEventListener('click', () => {
  const newString = new BasicStringLane({ basicLaneProps: basicLaneProps() });
  const tuning = tuningElementGenerator(newString);

  newString.addTuningElem(tuning)
    .createInTarget({ element: newString.tuningElement, atBeginning: true});

  fretboard.createStringAtIndex(newString)
    .addSoundMarksOnString(newString);
});

document.getElementById('removeStringButton').addEventListener('click', () => {
  fretboard.removeStringByIndex();
});

document.getElementById('noteFlat').addEventListener('click', () => {
  currentConvention = (sound) => (sound.flatNote ?? sound.sound) + (sound.flatOctave ?? sound.octave);
  fretboard.changeNamingConvention(currentConvention);
});

document.getElementById('noteSharp').addEventListener('click', () => {
  currentConvention = (sound) => sound.soundString();
  fretboard.changeNamingConvention(currentConvention);
});

document.getElementById('noteFrequency').addEventListener('click', () => {
  currentConvention = (sound) => `${ sound.getFrequencyFromDistance().toFixed(0) }Hz`;
  fretboard.changeNamingConvention(currentConvention);
});
