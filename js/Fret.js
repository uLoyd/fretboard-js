import { Sound, sounds } from "./Sound.js";
import { DomElem } from "./DomElem.js";

export class Fret extends DomElem {
  constructor(DomElemProps, lane) {
    super(DomElemProps);

    this.mark = null;
    this.callback = () => {
      return (evt) => {
        evt.stopPropagation();

        const mark = !!this.mark;
        const offset = lane.tuningElement ? 1 : 0;
        const fret = Array.prototype.indexOf.call(this.elem.parentNode.children, mark ? evt.target.parentNode : evt.target) - offset;

        lane.callback(fret, lane, mark, evt);
      }
    }
  }

  create(text, selector, classes) {
    super.create(text, selector, classes);
    this.elem.addEventListener('click', this.callback());

    return this;
  }

  noteMark(note) {
    if(this.mark)
      return;

    this.mark = note;
    this.createInTarget({ element: this.mark });
    this.mark.elem.addEventListener('click', this.callback());
    return this;
  }

  empty() {
    this.mark?.remove();
    this.mark = null;

    return this;
  }
}
