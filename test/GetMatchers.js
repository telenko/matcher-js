import { defineMatcher, getMatchers } from '../src';
import { delay } from './utils';

describe('getMatchers()', function() {
    before(function() {
        defineMatcher('[get-matchers-test-1]', class MatchersTestOne {
            get type() {
                return "one";
            }
            connectedCallback() {
            }
            disconnectedCallback() {
            }
        });
        defineMatcher('[get-matchers-test-2]', class MatchersTestTwo {
            get type() {
                return "two";
            }
            connectedCallback() {
            }
            disconnectedCallback() {
            }
        });
    });
    it('should correctly retrieve matchers instances from node', async function() {
        const container = document.createElement('div');
        container.setAttribute('get-matchers-test-1', '');
        container.setAttribute('get-matchers-test-2', '');
        document.body.appendChild(container);
        await delay();

        let matchers = getMatchers(container);
        expect(matchers).to.have.length(2);
        expect(matchers.some(matcher => matcher.type === "one")).to.be.true;
        expect(matchers.some(matcher => matcher.type === "two")).to.be.true;

        container.removeAttribute('get-matchers-test-1');
        await delay();
        matchers = getMatchers(container);
        expect(matchers).to.have.length(1);
        expect(matchers[0].type).to.be.equal('two');

        container.removeAttribute('get-matchers-test-2');
        await delay();
        matchers = getMatchers(container);
        expect(matchers).to.have.length(0);

        container.setAttribute('get-matchers-test-1', '');
        await delay();
        matchers = getMatchers(container);
        expect(matchers).to.have.length(1);
        expect(matchers[0].type).to.be.equal('one');
    });
});