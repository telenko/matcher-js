import { defineMatcher, getMatchers } from '../src';
import { delay } from './utils';

describe('.element', function() {
    before(function() {
        defineMatcher('[element-test]', class ElementTest1 {
            get type() {
                return "one";
            }
            connectedCallback() {
            }
            disconnectedCallback() {
            }
        });
    });
    it('should correctly be binded to node', async function() {
        const container = document.createElement('div');
        container.setAttribute('element-test', '');
        document.body.appendChild(container);
        await delay();

        let matchers = getMatchers(container);
        expect(matchers.every(matcher => matcher.element === container)).to.be.true;

        container.innerHTML = `
            <span element-test>
                <p element-test></p>
            </span>
        `;
        await delay();

        const span = container.querySelector('span');
        matchers = getMatchers(span);
        expect(matchers.every(matcher => matcher.element === span)).to.be.true;

        const p = container.querySelector('p');
        matchers = getMatchers(p);
        expect(matchers.every(matcher => matcher.element === p)).to.be.true;
    });
    it('should contain .element ref inside connectedCallback()', async function() {
        let element;
        defineMatcher('[element-test-2]', class ElementTest2 {
            connectedCallback() {
                element = this.element;
            }
        });

        const container = document.createElement('div');
        container.setAttribute('element-test-2', '');
        document.body.appendChild(container);
        await delay();

        expect(element === container).to.be.true;
    });
});