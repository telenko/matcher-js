import { defineMatcher } from '../src';
import { delay } from './utils';

describe('defineMatcher()', function() {
    describe("RestrictedNodes", function() {
        before(function() {
            defineMatcher('[restrict]', class RestrictMatcher {});
        });
        it(`shouldn't break DOM if text node or comment node appear`, async function() {
            const container = document.createElement('div');
            container.innerHTML = `
                <!-- test comment -->
                <span>text node inside</span>
                <!-- test comment -->
                <div restrict>text node inside</div>
            `;
            document.body.appendChild(container);
            await delay();
        });
    });
});