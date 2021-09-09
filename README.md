# fretboard-js

Fretboard module in vanilla js, in this case with bootstrap on a html5 boilerplate.

Basically just a bunch of classes to generate a customizable guitar fretboard able to display scales, mark specific sounds on frets and so on. Still a lot to be done there though. (Everything can change atm)

[Fretboard](./js/Fretboard.js) consists of [StringLanes](./js/StringLane.js)
that contain given number of [Frets](./js/Fret.js) that can be "marked" using a
[Note](./js/Note.js) that contains [Sound](./js/Sound.js) data.
Creation of DOM elements and IDs for StringLane instances happens
with help of [Utils](./js/utils.js).
[Tuning](./js/Tuning.js) is used to store the **initial** tuning and contains methods to check
if it's standard / drop / double drop tuning.

## Initialization

```javascript
import { Fretboard, Sound, sounds } from "custom-fretboard"

const container = document.getElementById('fretboard'); // Some DOM element supposed to hold the fretboard

// Fretboard init
const fretboardInstance = new Fretboard({
  container: container, // Optional if fretboard's supposed to do only logical operations without displaying data
                        // otherwise required

  frets: 12,            // required, int - number of frets on each fretboard string

  tuning: [             // optional, Sound[] - Sound class instances (Sound class can alternatively be initialized with static
    new Sound('E', 4),// class constructor Sound.frequencyConstructor(float) by passing frequency (Hz) as parameter
    new Sound('B', 3),// ie. Sound.frequencyConstructor(440) outputs a Sound instance containing sound A4.
    new Sound('G', 3),// Although optional without tuning no strings will be created and it will be useless, but the string
    new Sound('D', 3),// instances can be added directly to fretboardInstance.stringInstances array, or by method
    new Sound('A', 2),// fretboardInstance.addString(new Sound('A', 2), true, true) after initialization
    new Sound('E', 2)
  ],

  octaveRange: { // optional, Object - contains two values from which will be created array of possible octaves to be set
    min: 1,    // ranging from min property value to max property value. If object is not defined 4th octave will be fixed
    max: 2     // for every sound in the tuning
  },

  onTuningChangeEvt: (evt, lane) => {},// optional, callback - called on event of tuning change if allowTuningChange value
                                       // was set to true. It receives
                                       // - event object
                                       // - StringLane instance on which the tuning has been changed
                                       // If callback is not passed than tuning will be "fixed"
                                       // otherwise it will be created as dropdown with options being all the sounds

  onOctaveChangeEvt: (evt, lane) => {},// optional, callback - called on event of octave change if allowTuningChange value
                                       // was set to true. It receives:
                                       // - event object
                                       // - StringLane instance on which the octave has been changed
                                       // If callback is not passed than tuning will be "fixed"
                                       // otherwise it will be created as dropdown with options being

  fretsClick: (tuning, fretSound, marked, evt) => {},// optional, callback - called on event of fret click. It recieves:
                                                     // - tuning, Sound - Sound instance of the string to which the fret belongs
                                                     // - fretSound, Sound - Sound instance of the sound on clicked fretboard
                                                     // ie. clicking 5th fret of string in E2 tuning it will contain A2 sound
                                                     // - marked, boolean - true if the Note was present on the fret during
                                                     // the click event
                                                     // - event object

  emptyStringClasses: [], // optional, String[] (default = ['col', 'd-flex', 'justify-content-center'])
                          // As the empty guitar string is represented as the fret with index 0 it can be styled separately.
                          // All default css classes are from bootstrap.

  fretElemClasses: [],    // optional, String[] (default = ['col', 'fret_place', 'd-flex', 'justify-content-center'])
                          // Same situation as with emptyStringClasses plus additional 'fret_place' class let's add any
                          // additional rules without need to change the default value most of the time

  noteElemClasses: [],    // optional, String[] (default = ['rounded', 'col', 'p-1', 'fret_mark'])
                          // Same situation but for Notes (the marks on frets) with additional class fret_mark

  stringLaneElemClasses: {// All css classes related to StringLane goes here
    lane: [],           // optional, String[] (default = ['row', 'bg-dark', 'fret_lane'])
                        // Css classes related to the lane itself that contains all the frets, tuning and octave elements
                        // with additional fret_lane class

    option: [],         // optional, String[] (default = [])
                        // Css classes related to octave and tuning dropdowns in case either allowTuningChange
                        // or allowOctaveChange were set to true

    tuningFixed: [],    // optional, String[] (default = ['col', 'bg-success', 'fixed_tuning'])
                        // If tuning wasn't set to true here should go css classes responsible for it

    octaveFixed: []     // optional, String[] (default = ['col', 'bg-info', 'fixed_tuning'])
                        // If octave wasn't set to true here should go css classes responsible for it as well
  },

  namingConvention: (sound) => {} // optional, callback [default = (sound) => sound.sound + sound.octave;]
                                  // - called every time a method responsible for creating
                                  // a DOM element from a Note class creating a "mark" on a fret
                                  // Receives:
                                  // sound, Sound instance - sound on the fret that's currently supposed to be marked
                                  // Returns:
                                  // String - text that will be displayed on the mark
});
```

So the most basic initialization can look like this:

```javascript
const container = document.getElementById('fretboard');

const fretboardInstance = new Fretboard({
  container,
  frets: 12,
  tuning: [
    new Sound('E', 4),
    new Sound('B', 3),
    new Sound('G', 3),
    new Sound('D', 3),
    new Sound('A', 2),
    new Sound('E', 2)
  ]
});
```

## Methods
Fretboard class has two main types of methods. Those either alter its properties and crunch data or create DOM elements based on current values stored by the class itself. Almost all of them (except addString, findStringIndex, findCurrentExactSound and findCurrentExactSoundIndex methods) returns the Fretboard instance therefore most of the calls can be chained without a problem.

### DOM methods
**create()**

Receives: Int[]

Returns: Fretboard instance

This method creates all the StringLane DOM elements including the frets, octave and tuning elements.
Additionally, an array of integers in range <0; tuning.length> can be passed in parameter. In case the array is passed on the bottom of the fretboard will be created additional StringLane with marks on frets specified in the array. In case of empty call the bottom lane with marks will simply not be created.
```javascript
fretboardInstance.create([0, 3, 5, 7, 9, 12]);
```

**addExactSoundMarksOnStrings(sound, addToCurrent = true)**

Receives: Sound Instance, Boolean (default = true)

Returns: Fretboard instance

Adds Note marks on all frets of all strings corresponding to the sound passed through parameter.
Correct frets positions on every StringLane is calculated by the StringLane class itself. **Only the frets with exact sound in exact octave** will be marked. In case the second parameter will be set to false, then currently added sound will not be added to the sounds currently stored by the Fretboard instance.


```javascript
fretboardInstance.addExactSoundMarksOnStrings(new Sound('A', 4));
```

**addSoundMarksOnStrings()**

Receives:

Returns: Fretboard instance

Adds all Notes ("marks") on all frets of all strings corresponding to all sounds stored by the Fretboard class instance in *currentSounds* and *currentExactSounds* properties.


```javascript
fretboardInstance.addSoundMarksOnStrings();
```

**addSoundMarksOnStringIndex(stringIndex)**

Receives: Int ( in range <0, tuning.length) )

Returns: Fretboard instance

Adds all Notes ("marks") on all frets of one specified string corresponding to all sounds stored by the Fretboard class instance in *currentSounds* and *currentExactSounds* properties. The string on which the sounds will be marked is retrieved by its index. The index of StringLane instances in Fretboard is the same as it was passed in *tuning* property during initialization.

```javascript
fretboardInstance.addSoundMarksOnStringIndex(1);
```

**addSoundMarksOnString(string)**

Receives: StringLane instance

Returns: Fretboard instance

Same method as *addSoundMarksOnStringIndex(stringIndex)* with only difference being the parameter passed as in this case it receives StringLane instance instead of its index.
StringLane passed in parameter doesn't have to be from the Fretboard instance it's passed to.

```javascript
const newString = fretboardInstance.addString(new Sound('A', 2), true, true);
fretboardInstance.addSoundMarksOnString(newString);
```

**clearAllFrets()**

Receives:

Returns: Fretboard instance

Removes Note marks from every fret on every string.

```javascript
fretboardInstance.clearAllFrets();
```

**removeFretboard()**

Receives:

Returns: Fretboard instance

Removes all elements inside the container passed to Fretboard during initialization and empties *fretboardInstance.stringInstances* array.

```javascript
fretboardInstance.removeFretboard();
```

### Logical methods

**addString(sound, create = true, addToTuning = false)**

Receives: Sound instance, Boolean (default = true), Boolean (default = false)

Returns: StringLane instance

Creates new StringLane instance with tuning based on *sound* parameter that's supposed to be a Sound instance. Parameter *create* defines if the StringLane DOM element will be created right after initialization or not. By default, it's set to true therefore it's being appended to the fretboard. The *addToTuning* parameter defines if the Sound instance from first parameter will be pushed into the locally stored tuning of Fretboard. StringLane is added to the end of all the other strings.

(Note that tuning can be changed at any time and all the sound marks are being calculated based on StringLane elements so if Fretboard instance tuning property needs to be updated on StringLane tuning/octave changes it should be done by hand in the *onTuningChangeEvt* and *onOctaveChangeEvt* in the constructor)

```javascript
fretboardInstance.addString(new Sound('A', 2), true, true);
```

Sample solution to update Fretboard instance tuning
```javascript
const container = document.getElementById('fretboard');

const fretboardInstance = new Fretboard({
  container,
  frets: 12,
  tuning: [
    new Sound('E', 4),
    new Sound('B', 3),
    new Sound('G', 3),
    new Sound('D', 3),
    new Sound('A', 2),
    new Sound('E', 2)
  ],
  onTuningChangeEvt: (evt, lane) => {
    fretboardInstance.tuning = fretboardInstance.getStringLanesTuning();
  }
});
```

**findStringIndex(string)**

Receives: StringLane instance

Returns: Int

Finds index of StringLane instance inside the *stringInstances* property of Fretboard instance.

**Every StringLane instance has a unique id so different instance with the same tuning value won't be returned**

```javascript
const newString = fretboardInstance.addString(new Sound('A', 2), true, true);
const differentString = new StringLane({
  frets: 12,
  tuning: new Sound('A', 2)
});
console.log(fretboardInstance.findStringIndex(newString)); // returns index of string instance
console.log(fretboardInstance.findStringIndex(differentString)); // returns -1 as it doesn't contains such a StringLane instance
```

**removeString(string, removeDom = true, removeFromTuning = true)**

Receives: StringLane instance, Boolean (default = true), Boolean (default = true)

Returns: Fretboard instance

Removes specific, passed through the first parameter, StringLane instance. In case the second *removeDom* parameter is set to true than it will also remove DOM element related to that StringLane. Third parameter *removeFromTuning* being set to true will result in the related Sound in tuning array being removed as well therefore after consecutive calls fretboardInstance.remove().create(); it won't be created again.

```javascript
const newString = fretboardInstance.addString(new Sound('A', 2), true, true);
fretboardInstance.removeString(newString);
```

**removeStringByIndex(index, removeDom = true, removeFromTuning = true)**

Receives: Int, Boolean (default = true), Boolean (default = true)

Returns: Fretboard instance

Same method as *removeString* with the difference being specifying string by its index in *stringInstances* array instead of passing the StringLane reference itself.

```javascript
const newString = fretboardInstance.addString(new Sound('A', 2), true, true);
fretboardInstance.removeString(fretboardInstance.stringInstances.length - 1);
```

**addCurrentSound(soundIndex)**

Receives: Int <0, 11>

Returns: Fretboard instance

Adds specific note in any octave (A = 0, G# = 11) to *currentSounds* array.

**If previously an EXACT sound like fretboardInstance.addCurrentExactSound(new Sound('A', 2)); was added then after fretboardInstance.addCurrentSound(0); all sounds in 'A' note will be removed from *currentExactSounds* array**

```javascript
fretboardInstance.addCurrentSound(1);
```

**findCurrentExactSound(sound)**

Receives: Sound instance

Returns: Sound instance || -1

If sound is present in *currentExactSounds* array it will return the sound otherwise it will return -1.

```javascript
fretboardInstance.findCurrentExactSound(new Sound('A', 2));
```

**findCurrentExactSoundIndex(sound)**

Receives: Sound instance

Returns: Int

Returns index of a given sound in *currentExactSounds* array or -1 if it doesn't exist within it.

```javascript
fretboardInstance.findCurrentExactSound(new Sound('A', 2));
```

**addCurrentExactSound(sound)**

Receives: Sound instance

Returns: Fretboard instance

Adds specific sound to *currentExactSounds* array if it doesn't exist. Duplicate won't be added.

```javascript
fretboardInstance.addCurrentExactSound(new Sound('A', 2));
```

**removeCurrentExactSound(sound)**

Receives: Sound instance

Returns: Fretboard instance

Removes specific sound to *currentExactSounds* array if it exists.

```javascript
fretboardInstance.removeCurrentExactSound(new Sound('A', 2));
```

**removeSoundAll(soundIndex)**

Receives: Int <0, 11>

Returns: Fretboard instance

Removes sound with specific note both from *currentExactSounds* and *currentSounds* array.

```javascript
fretboardInstance.removeSoundAll(0);
```

**switchCurrentExactSound(sound)**

Receives: Sound instance

Returns: Fretboard instance

If specific sound in specific octave is present in the *currentExactSounds* array it calls *removeCurrentExactSound* method, otherwise it calls *addCurrentExactSound* passing to them Sound instance received as argument.

```javascript
fretboardInstance.switchCurrentExactSound(new Sound('A', 2));
```

**switchSoundOnOff(sound)**

Receives: String (sound symbol A - G#)

Returns: Fretboard instance

Iterates through strings adding / removing sound. If sound passed in argument is currently "marked" in current position it will remove it and vice versa. It's useful ONLY for sounds that were added globally (on all strings through addSoundMarksOnStrings method) otherwise if let's say sound was added on one specific fret it will remove it from this exact location and add it in all other ones.

```javascript
fretboardInstance.switchSoundOnOff('A');
```

**changeNamingConvention(convention, reload = true)**

Receives: callback, Boolean (default = true)

Returns: Fretboard instance

Changes callback used for creating text inside Note instance DOM elements. With *reload* parameter set to true after changing the callback all currently displayed "marks" on the fretboard will be updated using new callback.

```javascript
fretboardInstance.changeNamingConvention((sound) => sound.sound.toLowerCase() + sound.octave);
```

**getStringLanesTuning()**

Receives:

Returns: Tuning instance

Gets current sound and octave of every displayed string and returns those as Tuning instance.

```javascript
fretboardInstance.getStringLanesTuning();
```
