import { RUNNER } from "../Matcher/Runner";

export class ExtensionContainer extends HTMLElement {

  connectedCallback() {
    RUNNER.apply(this);
    this.style.display = "contents";
  }

}
