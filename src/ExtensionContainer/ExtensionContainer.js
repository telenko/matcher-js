import { RUNNER } from "../Matcher/Runner";

export class ExtensionContainer extends HTMLElement {

  connectedCallback() {
    RUNNER.add(this);
    this.styles.display = "contents";
  }

  //todo disconnectedCallback

}
