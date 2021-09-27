import {
  DefaultTuningFinder,
  StandardTuning,
  GenericStringBuilder,
  GenericFretboardBuilder,
  FlatOctave,
  SharpOctave,
  Frequency
} from "./fretboard";

const container = document.getElementById("fretboard");

let currentConvention = SharpOctave;

const fretboard = GenericFretboardBuilder();
fretboard.createInTarget({ element: fretboard, target: container, atBeginning: true });

document.getElementById('addStringButton').addEventListener('click', () => {
  const newTuningProps = { strings: fretboard.stringInstances.length + 1, startSound: fretboard.stringInstances[0] };
  const foundTuning = new DefaultTuningFinder().find(fretboard.stringInstances);
  const tuning = (foundTuning.Unknown ? new StandardTuning() : foundTuning).generate(newTuningProps);
  fretboard.empty();

  fretboard.stringInstances = tuning.map(sound => GenericStringBuilder(sound, fretboard, currentConvention));

  fretboard.addSoundMarksOnStrings();
});

document.getElementById('removeStringButton').addEventListener('click', () => {
  fretboard.removeStringByIndex();
});

document.getElementById('noteFlat').addEventListener('click', () => {
  currentConvention = FlatOctave;
  fretboard.setNamingConvention(currentConvention);
});

document.getElementById('noteSharp').addEventListener('click', () => {
  currentConvention = SharpOctave;
  fretboard.setNamingConvention(currentConvention);
});

document.getElementById('noteFrequency').addEventListener('click', () => {
  currentConvention = Frequency;
  fretboard.setNamingConvention(currentConvention);
});

document.getElementById('allSounds').addEventListener('click', () => {
  fretboard.exactSounds.sounds.forEach(sound => fretboard.generalSounds.add(sound.soundIndex));
  fretboard.exactSounds.empty();
  fretboard.addSoundMarksOnStrings();

  fretboard.setFretClick((fret, lane) => {
    fretboard.exactSounds.sounds.forEach(sound => fretboard.generalSounds.add(sound.soundIndex));
    fretboard.generalSounds.reverse(lane.findSoundByPlace(fret).soundIndex);
    fretboard.addSoundMarksOnStrings();
  })
});

document.getElementById('sameOctave').addEventListener('click', () => {
  fretboard.setFretClick((fret, lane) => {
    fretboard.exactSounds.reverse(lane.findSoundByPlace(fret));
    fretboard.addSoundMarksOnStrings();
  })
});
