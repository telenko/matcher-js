# General description
...tbd

# Purpose of creating
...tbd

# API
```
import { defineMatcher } from 'matcher-js';

class DatePicker {

  connectedCallback() {
    //TODO when matcher attached to node
    const { element } = this;
    somePickerLibrary(this.element,
      { from: element.getAttribute("from"),
        to: element.getAttribute("to")
      });
  }

  disconnectedCallback() {
    somePickerLibrary(this.element).off();
  }

  attributeChangedCallback(attr, oldv, newv) {
    if (attr === "from") {
      somePickerLibrary(this.element).setFrom(newv);
    }
    if (attr === "to") {
      somePickerLibrary(this.element).setTo(newv);
    }
  }

  static get observedAttributes() {
    return ["from", "to"];
  }

}

//will connect matcher for all nodes with [type='datepicker']
//will disconnect when node won't meet matcher query anymore
defineMatcher("[type='datepicker']", DatePicker);
```
