import { createDomElement } from "./utils.js";

export class ScaleLib{
  constructor(scales) {
    this.scales = [];

    if(scales)
      scales.forEach(scale => this.scales.push(new Scale(scale)));

    return this;
  }

  createAllScaleElements(target){
    this.scales.forEach(scale => scale.createDomElement(target));

    return this;
  }

  findById(id) {
    return this.scales.find(scale => scale.id === id);
  }
}

export class Scale{
  constructor(data) {
    this.id = data['Scale.id'] ?? data.id;

    this.sounds = data['Scale.sounds'] ?
      data['Scale.sounds'].split('').map(x => x === '1') :
      data.scale ?? data.sounds?.split('').map(x => x === '1');

    this.name = data['Scale.name'] ?? data.name;
    this.tonic = data['Scale.tonic'] ?? data.tonic;

    return this;
  }

  createDomElement(target) {
    const elem = createDomElement('option', null, this.name);
    elem.value = this.id;
    target.appendChild(elem);

    return elem;
  }

  shiftToTonic(targetTonic) {
    const diff = this.tonic - targetTonic;
    const arrCopy = [...this.sounds];

    if(diff === 0)
      return arrCopy;

    return arrCopy.splice(diff, arrCopy.length - diff).concat(arrCopy);
  }

  async saveNewScale(url) {
    const rawResponse = await fetch(url, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        scale: this.sounds,
        name: this.name,
        tonic: this.tonic
      })
    });

    const response = await rawResponse;
    const jsonResponse = await response.json();

    return { response: response, json: jsonResponse }
  }
}
