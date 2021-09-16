import { BasicStringLane, BasicFretboard, BasicTuningElem, sounds } from "./index.js";

const container = document.getElementById("fretboard");

const stringLaneProps = [
  { sound: 'E', octave: 4 },
  { sound: 'B', octave: 3 },
  { sound: 'G', octave: 3 },
  { sound: 'D', octave: 3 },
  { sound: 'A', octave: 2 },
  { sound: 'E', octave: 2 }
];

BasicFretboard.init();
BasicStringLane.init();

const tuningChange = (evt, tuning) => {
  tuning.selected = evt.target.value;
}

const fretClick = (fret, lane, marked, evt) => {
  fretboard.generalSounds.reverse(lane.findSoundByPlace(fret).soundIndex);
  //fretboard.exactSounds.reverse(lane.findSoundByPlace(fret));
  fretboard.addSoundMarksOnStrings();
}


const stringLanes = BasicStringLane.bulkConstructor({
  stringLaneProps,
  basicLaneProps: {
    callback: fretClick
  }
});

stringLanes.forEach(lane => {
  const tuning = new BasicTuningElem({
    stringLane: lane,
    onchange: tuningChange
  }).createElem();

  lane.addTuningElem(tuning)
    .createInTarget({ element: lane.tuningElement, atBeginning: true});
});

const fretboard = new BasicFretboard({ stringLanes });
fretboard.createInTarget({ element: fretboard, atBeginning: true, target: container })
  .createStringLanes();

document.getElementById('addStringButton').addEventListener('click', () => {
  const newString = new BasicStringLane({ basicLaneProps: { callback: fretClick } });

  newString.addTuningElem(new BasicTuningElem({
    stringLane: newString,
    onchange: tuningChange
  }).createElem())
    .createInTarget({ element: newString.tuningElement, atBeginning: true});

  fretboard.createStringAtIndex(newString);
});
