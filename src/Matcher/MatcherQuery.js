const ATTR_REGEX = /^([\w+|\-]+){0,1}((\[([^\"\'\=\]]+)(\=(\"|\')(\w+)(\"|\')){0,1}\])|(\.(\w+))){0,1}$/;
const ATTRIBUTE = Symbol();
const VALUE = Symbol();

export class MatcherQuery {

  constructor(queryString) {
    const [,,,,attribute,,,value] = queryString.match(ATTR_REGEX);
    this[ATTRIBUTE] = attribute;
    this[VALUE] = value;
  }

  get attribute() {
    return this[ATTRIBUTE];
  }

  isMatches(attrsMap) {
    if (!this[VALUE]) {
      return typeof attrsMap[this.attribute] !== "undefined";
    }
    return attrsMap[this.attribute] === this[VALUE];
  }

}
