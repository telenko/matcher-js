import { defineMatcher, patchShadowDOM } from '../src';
import { delay } from './utils';

describe('ShadowDOM', function() {
    before(function() {
        const connected = this.connectedSpy = sinon.spy();
        defineMatcher('[container-test]', class ContainerTest {
            get type() {
                return "container";
            }
            connectedCallback() {
                connected();
            }
            disconnectedCallback() {
            }
        });
    });
    describe('MatchersContainer', function() {
        it('should correctly be binded to node', async function() {
            const container = document.createElement('div');
            container.innerHTML = `
                <div id='1' container-test></div>
            `;
            container.attachShadow({ mode: 'open' });
            container.shadowRoot.innerHTML = `
                <matchers-container>
                    <div container-test  id='2'>
                        <div another-container></div>
                    </div>
                </matchers-container>
            `;
            const anotherContainer = container.shadowRoot.querySelector('[another-container]');
            anotherContainer.attachShadow({ mode: 'open' });
            anotherContainer.shadowRoot.innerHTML = `
                <matchers-container>
                    <p id='3' container-test></p>
                    <div third-container></div>
                </matchers-container>
            `;
            const thirdContainer = anotherContainer.shadowRoot.querySelector('[third-container]');
            thirdContainer.attachShadow({ mode: 'open' });
            thirdContainer.shadowRoot.innerHTML = `
                <!-- no matchers here -->
                <div container-test>
                    <span container-test></span>
                </div>
            `;
            document.body.appendChild(container);
            await delay();
    
            expect(this.connectedSpy.callCount).to.be.equal(3);
            this.connectedSpy.resetHistory();
        });
    });

    describe('patchShadowDOM()', function() {
        before(function() {
            patchShadowDOM();
        });
        it('should correctly be binded to node', async function() {
            const container = document.createElement('div');
            container.innerHTML = `
                <div id='4' container-test></div>
            `;
            container.attachShadow({ mode: 'open' });
            container.shadowRoot.innerHTML = `
                    <div container-test  id='5'>
                        <div another-container></div>
                    </div>
            `;
            const anotherContainer = container.shadowRoot.querySelector('[another-container]');
            anotherContainer.attachShadow({ mode: 'open' });
            anotherContainer.shadowRoot.innerHTML = `
                    <p id='6' container-test></p>
                    <div third-container></div>
            `;
            const thirdContainer = anotherContainer.shadowRoot.querySelector('[third-container]');
            thirdContainer.attachShadow({ mode: 'open' });
            thirdContainer.shadowRoot.innerHTML = `
                <!-- no matchers here ? but we are using patch! -->
                <div container-test id='7'>
                    <span container-test></span>
                </div>
            `;
            document.body.appendChild(container);
            await delay();
    
            expect(this.connectedSpy.callCount).to.be.equal(5);
            this.connectedSpy.resetHistory();
        });
    });
});