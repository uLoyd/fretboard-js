import { DomElem } from "../components/DomElem.js";
import { Sound, sounds } from "../components/Sound.js";

export class BasicTuningSelect extends DomElem {
  constructor({ DomElemProps = { selector: 'select' }, optionsDomElemProps = { selector: 'option' }, options, selected, onchange }) {
    super(DomElemProps);
    this.optionsDomElemProps = optionsDomElemProps;
    this.options = options;
    this.selected = selected;
    this.onchange = function (evt) {
      onchange(evt, this);
    };
  }

  create(text, selector = this.selector, classes = this.classes) {
    if(this.elem)
      return this;

    super.create(text, selector, classes);
    this.elem.addEventListener("change", evt => this.onchange(evt));

    return this;
  }

  createOptions(valueCallback) {
    this.options.forEach( option => {
      const opt = new DomElem(this.optionsDomElemProps);
      this.createInTarget({ element: opt.create(option) });
      opt.elem.value = valueCallback ? valueCallback(option) : option;

      if(option === this.selected)
        opt.elem.selected = true;
    });

    return this;
  }
}

export class BasicTuningElem extends DomElem {
  constructor({ DomElemProps = {}, soundOptions = sounds, stringLane = {}, octaveRange = { min: 1, max: 9 }, onchange = function (){} }) {
    super(DomElemProps);

    const range = [];
    for(let i = octaveRange.min; i < octaveRange.max; i++)
      range.push(i);

    this.sound = new BasicTuningSelect({
      options: soundOptions,
      selected: stringLane.sound,
      onchange
    });

    this.octave = new BasicTuningSelect({
      options: range,
      selected: stringLane.octave,
      onchange
    });
  }

  create() {
    super.create()
      .createInTarget({ element: this.sound.createOptions() })
      .createInTarget({ element: this.octave.createOptions() });

    return this;
  }

  getTuning(){
    return new Sound(this.sound.selected, this.octave.selected);
  }
}

export const basicTuningElemGenerator = (stringLane, fretboard) => {
  const tuningChange = (evt, tuning) => {
    tuning.selected = evt.target.value;
    fretboard.selfCheck();
  }

  return new BasicTuningElem({
    stringLane,
    onchange: tuningChange
  });
}
