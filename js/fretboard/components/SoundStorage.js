export class ISoundStorage {
  constructor(comparison, addAction, removeAction) {
    this.sounds = [];
    this.comparison = comparison;
  }

  add() {
    return this;
  }

  remove() {
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

  empty() {
    this.sounds = [];
    return this;
  }
}

export class GeneralStorage extends ISoundStorage {
  constructor(comparison = (sound, value, id) => id === sound) {
    super(comparison);
    this.sounds = new Array(12).fill(false);
  }

  add(soundIndex) {
    this.sounds[soundIndex] = true;
    return this;
  }

  remove(soundIndex) {
    this.sounds[soundIndex] = false;
    return this;
  }
}

export class ExactStorage extends ISoundStorage {
  constructor(comparison = (sound, value) => sound.soundString() === value.soundString()) {
    super(comparison);
  }

  add(sound) {
    if(!this.find(sound))
      this.sounds.push(sound);

    return this;
  }

  remove(sound) {
    const index = this.findIndex(sound);

    if(index > -1)
      this.sounds.splice(index, 1);

    return this;
  }
}
