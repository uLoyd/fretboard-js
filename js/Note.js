import { createDomElement } from "./utils.js";

export class Note{
  constructor(sound, classes) {
    this.sound = sound;
    this.domElement = null;
    this.classes = classes ?? ['rounded', 'col', 'p-1', 'fret_mark'];
    return this;
  }

  create() {
    if(this.domElement)
      return this;

    const colorClass = `n${this.sound.sound.toLowerCase().replace('#', 's')}`;
    this.domElement = createDomElement(
      'div',
      this.classes.concat([colorClass]),
      this.sound.toString()
    );

    return this;
  }
}
