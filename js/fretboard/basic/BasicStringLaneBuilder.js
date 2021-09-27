import { basicTuningElemGenerator } from "./BasicTuningElem.js";

export class BasicStringLaneBuilder {
  constructor(props, StringLaneClass){
    StringLaneClass.init();
    this.stringLaneProps = props;
    this.stringLaneClass = StringLaneClass;
  }

  setDomElemProps(props) {
    this.domElemProps = props;
    return this;
  }

  setBasicLaneProps(props) {
    this.basicLaneProps = props;
    return this;
  }

  setFretDomElemProps(props) {
    this.basicLaneProps.fretDomElemProps = props;
    return this;
  }

  setNoteDomElemProps(props) {
    this.basicLaneProps.noteDomElemProps = props;
    return this;
  }

  createLane(fretboard, index, generator = basicTuningElemGenerator, create = true) {
    this.generate();
    this.lane.addTuningElem({ fretboard, generator, create });
    fretboard.createStringAtIndex(this.lane, index);
    return this;
  }

  generate() {
    const { stringLaneProps, domElemProps, basicLaneProps } = this;
    this.lane = this.lane ?? new this.stringLaneClass({ stringLaneProps, domElemProps, basicLaneProps });
    return this;
  }

  get() {
    this.generate();
    return this.lane;
  }
}
