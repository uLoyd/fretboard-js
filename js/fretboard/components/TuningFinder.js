import { DoubleDropTuning, DropTuning, ITuning, StandardTuning, WildcardTuning } from "./Tuning.js";

export class TuningFinder {
  constructor() {
    this.tunings = [];

    for(let i = 0; i < arguments.length; ++i)
      this.registerTuning(arguments[i]);
  }

  registerTuning(tuning) {
    if(!(new tuning() instanceof ITuning))
      throw "Tuning class passed to TuningFinder doesn't extend ITuning";

    this.tunings.push(tuning);
  }

  removeTuning(tuning) {
    this.tunings = this.tunings.filter(check => tuning !== check);

    return this;
  }

  find(sounds) {
    const result = this.tunings.find(tuning => new tuning(sounds).check());

    return result ? new result(sounds) : false;
  }
}

export class DefaultTuningFinder extends TuningFinder {
  constructor() {
    super(StandardTuning, DropTuning, DoubleDropTuning, WildcardTuning);
  }
}
