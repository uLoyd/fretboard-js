function isFunc(something){
  return something && something instanceof Function;
}

export class SoundStorage {
  // addAction and removeAction are optional, enabling custom add / remove behaviour
  constructor(comparison, addAction, removeAction) {
    if(!isFunc(comparison))
      throw "Callback serving the purpose of value comparison is required";

    this.sounds = [];
    this.comparison = comparison;

    this.addAction = isFunc(addAction) ? addAction : null;

    this.removeAction = isFunc(removeAction) ? removeAction : null;
  }

  add(sound) {
    if(!this.find(sound))
      this.addAction ? this.sounds = this.addAction(sound, this.sounds) : this.sounds.push(sound);

    return this;
  }

  remove(sound) {
    const index = this.findIndex(sound);

    if(index > -1)
      this.removeAction ? this.sounds = this.removeAction(index, this.sounds) : this.sounds.splice(index, 1);

    return this;
  }

  // switches sound on/off - if it exists: removes it; if it doesn't exist: adds it
  reverse(sound) {
    const toSwitch = this.find(sound);

    toSwitch ? this.remove(sound) : this.add(sound);

    return this;
  }

  find(sound) {
    return this.sounds.find((value, id) => this.comparison(sound, value, id));
  }

  findIndex(sound) {
    return this.sounds.findIndex((value, id) => this.comparison(sound, value, id));
  }
}
