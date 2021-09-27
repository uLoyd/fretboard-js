import { BasicFretboardBuilder } from "../basic/BasicFretboardBuilder.js";
import { BasicFretboard } from "../basic/BasicFretboard.js";
import { StandardTuning } from "../components/Tuning.js";
import { GenericStringBuilder } from "./GenericStringBuilder.js";
import { Sound } from "../components/Sound.js";

const defaults = {
  builder: BasicFretboardBuilder,
  fretboardClass: BasicFretboard,
  tuningClass: StandardTuning,
  startSound: new Sound('E', 4),
  strings: 6,
  generator: GenericStringBuilder
}

export const GenericFretboardBuilder = (props = {}, ...args) => {
  for (const [key, value] of Object.entries(defaults))
    props[key] = props[key] ?? value;

  return new props.builder(props.fretboardClass)
    .setTuning(props.tuningClass, props.startSound, props.strings)
    .generate(props.generator, ...args)
    .get();
}
