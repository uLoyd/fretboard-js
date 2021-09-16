export class DomElem {
  constructor({ selector = 'div', classes = [] }) {
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
    if(!element)
      throw `DomElem received null/undefined element or target: ${element}`;

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
    parent.insertBefore(element, before);
  }

  empty() {
    this.elem.empty();
    return this;
  }

  remove() {
    this.elem.remove();
    this.elem = null;

    return this;
  };
}
