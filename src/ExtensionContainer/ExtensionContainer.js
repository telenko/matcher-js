import { RUNNER } from "../Matcher/Runner";

export class ExtensionContainer extends HTMLElement {

  connectedCallback() {
    RUNNER.apply(this);
    this.styles.display = "contents";
  }

  //todo disconnectedCallback

}
