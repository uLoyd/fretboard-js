import {BasicStringLane, BasicFretboard, DomElem} from "./index.js";

const container = document.getElementById("fretboard");

const StringLaneProps = [
  { sound: 'E', octave: 4 },
  { sound: 'B', octave: 3 },
  { sound: 'G', octave: 3 },
  { sound: 'D', octave: 3 },
  { sound: 'A', octave: 2 },
  { sound: 'E', octave: 2 }
];

BasicFretboard.init();
BasicStringLane.init();
const stringLanes = BasicStringLane.bulkConstructor(StringLaneProps);
const fretboard = new BasicFretboard({ stringLanes });
fretboard.createInTarget({ element: fretboard, atBeginning: true, target: container });
fretboard.createStringLanes();
