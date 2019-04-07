import { defineMatcher } from '../src';
import { delay } from './utils';

describe('defineMatcher()', function() {
    describe("NamedMatcher", function() {
        before(function() {
            const connected = this.connectedSpy = sinon.spy();
            const disconnected = this.disconnectedSpy = sinon.spy();
            defineMatcher('[some="test"]', class SomeMatcher {
                connectedCallback() {
                    connected();
                }
                disconnectedCallback() {
                    disconnected();
                }
            });
        });
        it('should catch matcher only if attr value "test"', async function() {
            const container = document.createElement('div');
            container.setAttribute('some', 'incorrect');
            document.body.appendChild(container);
            await delay();
            expect(this.connectedSpy.callCount).to.be.equal(0);
            expect(this.disconnectedSpy.callCount).to.be.equal(0);

            container.setAttribute('some', 'test');
            await delay();
            expect(this.connectedSpy.callCount).to.be.equal(1);
            expect(this.disconnectedSpy.callCount).to.be.equal(0);

            container.setAttribute('some', 'test2');
            await delay();
            expect(this.connectedSpy.callCount).to.be.equal(1);
            expect(this.disconnectedSpy.callCount).to.be.equal(1);

            container.setAttribute('some', 'test');
            await delay();
            expect(this.connectedSpy.callCount).to.be.equal(2);
            expect(this.disconnectedSpy.callCount).to.be.equal(1);

            container.removeAttribute('some');
            await delay();
            expect(this.connectedSpy.callCount).to.be.equal(2);
            expect(this.disconnectedSpy.callCount).to.be.equal(2);
        });
    });
});