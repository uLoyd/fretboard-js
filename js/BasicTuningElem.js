import { DomElem } from "./DomElem.js";

export class BasicTuningSelect extends DomElem {
  constructor({ DomElemProps, optionsDomElemProps, options, selected, onchange = function (){} }) {
    super(DomElemProps);
    this.optionsDomElemProps = optionsDomElemProps;
    this.options = options;
    this.selected = selected;
    this.onchange = onchange;
  }

  create(text, selector = this.selector, classes = this.classes) {
    super.create(text, selector, classes);
    this.elem.addEventListener("onchange", this.onchange);
  }

  createOptions(valueCallback) {
    if(!this.options)
      return this;

    if(!this.elem)
      this.create();

    this.options.forEach( option => {
      const opt = new DomElem(this.optionsDomElemProps);
      this.createInTarget({ element: opt });
      opt.elem.value = valueCallback(option);

      if(option === this.selected)
        opt.elem.selected = true;
    });

    return this;
  }
}

class BasicTuningElem extends DomElem {
  constructor({ DomElemProps = {}, soundElemProps, octaveElemProps }) {
    super(DomElemProps);

    this.sound = new BasicTuningSelect(soundElemProps);
    this.octave = new BasicTuningSelect(octaveElemProps);
  }

  createElem() {
    this.create()
      .createInTarget(this.sound.createOptions())
      .createInTarget(this.octave.createOptions());

    return this;
  }
}
