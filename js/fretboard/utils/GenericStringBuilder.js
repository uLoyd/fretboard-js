import { BasicStringLane } from "../basic/BasicStringLane.js";
import { BasicStringLaneBuilder } from "../basic/BasicStringLaneBuilder.js";
import { SharpOctave } from "../utils/NamingConventions.js";

export const GenericStringBuilder = (sound, fretboard, namingConvention = SharpOctave) => {
  const fretClick = (fret, lane, marked, evt) => {
    fretboard.generalSounds.reverse(lane.findSoundByPlace(fret).soundIndex);
    fretboard.addSoundMarksOnStrings();
  }

  return new BasicStringLaneBuilder(BasicStringLane, sound)
    .setDomElemProps({ classes: ['row', 'bg-dark', 'fret_lane'] })
    .setBasicLaneProps({
      namingConvention,
      callback: fretClick,
      includeZeroFret: true
    })
    .setFretDomElemProps({ classes: ['col', 'fret_place', 'd-flex', 'justify-content-center'] })
    .setNoteDomElemProps({ classes: ['rounded', 'col', 'p-1', 'fret_mark'] })
    .createLane(fretboard)
    .get();
}
