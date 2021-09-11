import { Sound, sounds } from "./Sound.js";
import { DomElem } from "./DomElem.js";

export class Fret extends DomElem {
  constructor(DomElemProps, callback = function (){}) {
    super(DomElemProps);

    this.mark = null;
    this.callback = () => {
      const mark = !!this.mark;
      return (evt) => {
        evt.stopPropagation();

        const tuning = new Sound(sounds[this.#getStringTuning(evt)], this.#getStringOctave(evt));
        const fret = Array.prototype.indexOf.call(this.domElement.parentNode.children, mark ? evt.target.parentNode : evt.target) - 2;
        const fretSound = Sound.getNoteFromDistance(tuning.getDistanceFromNote() + fret);
        const fretOctave = Sound.getOctaveFromDistance(tuning.getDistanceFromNote() + fret);

        callback(tuning, new Sound(sounds[fretSound], fretOctave), !!this.mark, evt);
      }
    }

    return this;
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
    this.mark.remove();
    this.mark = null;

    return this;
  }

  #getStringTuning = () => this.domElement.parentNode.children[0].value ?? sounds.indexOf(this.domElement.parentNode.children[0].innerText);

  #getStringOctave = () => this.domElement.parentNode.children[1].value ?? parseInt(this.domElement.parentNode.children[1].innerText);
}
