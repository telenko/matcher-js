# General description
Library allows to register callbacks to node based on attribute existence or value.

# Purpose of creating
New standard of registering elements (CustomElements) allows us to register new HTMLElements to the DOM. It allows us to handle some callbacks of new registered element (connectedCallback, disconnectedCallback, attributeChangedCallback). For details, see: https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements.

That new technology allows developer to write code by extending current DOM model with custom reusable html elements which really changed the approaches of web-development nowadays.

So with CustomElements definition we are able to extend DOM with whathever we want and use this new "patched" DOM environment for our applications. But is it really allows us to extend DOM in any possible way?

My vision that - **no**. And below why.

1) Reusable attributes - matchers
In current DOM API there are set of reusable attributes which can work for any html element: 'title', 'aria-label', 'role', 'class', 'id' etc. All these attributes are responsible for some behavior for a node, to which they are connected. If programically or via inspector such attribute will be removed - then it will be disconnected from "node". Looks pretty similar to "something" isn't it? Some piece of code can be "connected" to node by some "condition" and "disconnected" when this condition won't match anymore.

Since these attributes are not just regular attributes I've decided to invent a separate term for them - Matcher. Matcher is an entity which connects to html node when node matches matcher's condition. When node stops match this condition - matcher disconnects from a node.

Imagine that we want to implement new tooltip for our DOM elements and we want it to look much more modern than default native 'title'. We can write a new matcher with condition (f.e.) [custom-title] and then use it everywhere in our DOM:
```HTML
<div custom-title="some text in new title">
  <span custom-title="hey, I also want to use new title!!">
    Should I be a WC to use a custom title ? :(
  </span>
</div>
```

Lots of new libraries implements tooltip-like features via web components like this:
```HTML
<custom-title text='some text in new title'>
  <div not-a-container-anymore>
    <custom-title text='hey, I also want to use new title!!'>
      <span>ouch :( Likely I'm not a direct children of my parent div element...</span>
    </custom-title>
  </div>
</custom-title>
```
which I think is not pretty good usage for web components.

2) Extending native elements
Imagine that we need to support one more 'type' for input element - 'phone'. What will we do now? Hmmm, I think we can write a web component which will be a wrapper for a native one, support new type and it should definetely REFLECT everything we have in HTMLInputElement! Isn't it too costly for a one more type??

```HTML
<some-new-input ouch-forgot-to-reflect-blur-event type='phone'></some-new-input>
```

Which matchers we can define new matcher for already working input element and use it everywhere.
```HTML
<input type='phone'/>
```

To summarize, I want to highlight that I'm really a fan of new web components technologies, but I think that it is not appropriate everywhere. In some cases matchers are more suitable and easy to mainain.

# Difference between matcher and custom element
| Technology                       | Custom element                   | Matcher                          |
| -------------------------------- | -------------------------------- | -------------------------------- |
| matches when                     | by tagname                       | by attribute                     |
| when created (constructor call)  | html element create              | right before connectedCallback() |
| phase when connected             | connectedCallback()              | connectedCallback()              |
| phase when disconnected          | disconnectedCallback()           | disconnectedCallback()           |
| observed attributes property     | static observedAttributes        | static observedAttributes        |
| phase when observed attr changed | attributeChangedCallback()       | attributeChangedCallback()       |
| phase moved to a new document    | adoptedCallback()                | -                                |

As you see API of defining matcher is very-very similar to custom elements (one difference is matchers dont support adoptedCallback() unlike to custom elements)


# API

1) Install library
```
npm i @telenko/matcher
```
2) Include library to your code-base
```
import { defineMatcher, getMatchers } from '@telenko/matcher';
```
3) Define matchers via `defineMatcher` function
```
//only by attribute
defineMatcher("[custom-title]", class {
    connectedCallback() {
        //access real node by this.element
        console,log("Ok, now make tooltip for", this.element);
    }
    disconnectedCallback() {
        console.log("Remove new tooltip from", this.element);
    }
});
```
```
//by attribute value
defineMatcher("[some-attr='only-this-val'", class {
    connectedCallback() {
    }
    disconnectedCallback() {
    }
});
```
```
//observe attributes of node
defineMatcher("[type='datepicker'", class {
    
  connectedCallback() {
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

});
```

4) Access matchers via 'getMatchers' function
```
const inputWithDatepicker = this.querySelector("[type='datepicker]");
const matchers = getMatchers(inputWithDatepicker); // [DatepickerMatcher]
```

# Working with ShadowDOM
Since **matcher-js** is based on MutationObserver there are 2 ways to use matchers inside ShadowDOM:
1) Use 'patchShadowDOM' function (**should be called only once!!!**)
```
import { patchShadowDOM } from '@telenko/matcher';
patchShadowDOM();//will patch native .attachShadow() function with matchers support

const container = document.createElement("div");
container.attachShadow({mode : "open"});
container.shadowRoot.innerHTML = `
  <input type='datepicker' custom-title='wow, can use it here!!'/>
`;
```
2) Use ``` <matchers-container>``` container
```
const container = document.createElement("div");
container.attachShadow({mode : "open"});
container.shadowRoot.innerHTML = `
  <input type='datepicker' custom-title='ouch, matchers won't see me :('/>
  <matchers-container>
    <input type='datepicker' custom-title='good, unlike to bro above'/>
  </matchers-container>
`;
```

# Development status
Core functionality works. Currently library is under performance and unit testing state.