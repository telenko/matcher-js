import { RUNNER } from "../Matcher/Runner";

export class ExtensionContainer extends HTMLElement {

  connectedCallback() {
    //keeping correct order of matchers init (1st parent, then children)
    setTimeout(() => RUNNER.apply(this));
    this.style.display = "contents";
  }

}
