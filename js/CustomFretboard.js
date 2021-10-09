import {
  DefaultTuningFinder,
  StandardTuning,
  GenericStringBuilder,
  GenericFretboardBuilder,
  SharpOctave
} from "./fretboard";

export class CustomFretboard {
  constructor(currentConvention) {
    this.currentConvention = currentConvention ?? SharpOctave;
    this.fretboard = GenericFretboardBuilder();
  }

  init(container) {
    const { fretboard } = this;
    fretboard.createInTarget({ element: fretboard, target: container, atBeginning: true });

    return this;
  }

  changeConvention(convention) {
    this.currentConvention = convention;
    this.fretboard.setNamingConvention(this.currentConvention);

    return this;
  }

  addString() {
    const { fretboard } = this;

    const newTuningProps = { strings: fretboard.stringInstances.length + 1, startSound: fretboard.stringInstances[0] };
    const foundTuning = new DefaultTuningFinder().find(this.fretboard.stringInstances);
    const tuning = (foundTuning.Unknown ? new StandardTuning() : foundTuning).generate(newTuningProps);
    fretboard.empty();

    fretboard.stringInstances = tuning.map(sound => GenericStringBuilder(sound, fretboard, this.currentConvention));

    fretboard.addSoundMarksOnStrings();

    return this;
  }

  changeSoundAll() {
    const { fretboard } = this;

    fretboard.exactSounds.sounds.forEach(sound => fretboard.generalSounds.add(sound.soundIndex));
    fretboard.exactSounds.empty();
    fretboard.addSoundMarksOnStrings();

    fretboard.setFretClick((fret, lane) => {
      fretboard.exactSounds.sounds.forEach(sound => fretboard.generalSounds.add(sound.soundIndex));
      fretboard.generalSounds.reverse(lane.findSoundByPlace(fret).soundIndex);
      fretboard.addSoundMarksOnStrings();
    });

    return this;
  }

  changeSoundSameOctave() {
    const { fretboard } = this;
    fretboard.setFretClick((fret, lane) => {
      fretboard.exactSounds.reverse(lane.findSoundByPlace(fret));
      fretboard.addSoundMarksOnStrings();
    });

    return this;
  }
}
