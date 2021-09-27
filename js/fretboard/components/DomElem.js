export class DomElem {
  constructor(obj = {}) {
    const { selector = 'div', classes = [] } = obj;
    this.selector = selector;
    this.classes = classes;
    this.elem = null;
  }

  create(text, selector = this.selector, classes = this.classes) {
    if(this.elem)
      return this;

    this.elem = document.createElement(selector);

    classes.forEach(cl => this.elem.classList.add(cl));

    if(text != null)
      this.elem.innerText = text;

    return this;
  }

  retrieveElem(element) {
    if(!element){
      console.error('DomElem.retrieveElem bad argument');
      throw `DomElem received null/undefined element or target: ${element}`;
    }


    return element['create'] ?
      element.elem ? element.elem : element.create().elem :
      element;
  }

  createInTarget({ element, atBeginning = false, target = this }) {
    const elem = this.retrieveElem(element);
    target = this.retrieveElem(target);

    atBeginning ? target.prepend(elem) : target.appendChild(elem);

    return this;
  }

  createBefore({ element = this, before, parent = this }) {
    parent = this.retrieveElem(parent);
    before = this.retrieveElem(before);
    element = this.retrieveElem(element);

    parent.insertBefore(element, before);
  }

  empty() {
    this.elem.innerHTML = '';
    return this;
  }

  remove() {
    this.elem.remove();
    this.elem = null;

    return this;
  };
}
