import { createDomElement } from "./utils.js";

export class Note{
  constructor(sound) {
    if(!sound)
      console.trace(sound);
    this.sound = sound;
    this.domElement = null;

    return this;
  }

  create() {
    if(this.domElement)
      return this;

    const colorClass = `n${this.sound.sound.toLowerCase().replace('#', 's')}`;
    this.domElement = createDomElement(
      'div',
      ['rounded', 'col', 'p-1', 'fret_mark', colorClass],
      this.sound.toString()
    );

    return this;
  }
}
