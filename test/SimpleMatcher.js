import { defineMatcher } from '../src';
import { delay } from './utils';

describe('defineMatcher()', function() {
    describe('SimpleMatcher', function() {
        before(function() {
            const connected = this.connectedSpy = sinon.spy();
            const disconnected = this.disconnectedSpy = sinon.spy();
            defineMatcher('[simple]', class SimpleMatcher {
                connectedCallback() {
                    connected();
                }
                disconnectedCallback() {
                    disconnected();
                }
            });
        });
    
        it('should call connected/disconnected callback', async function() {
            const container = document.createElement('div');
            container.setAttribute('simple', '');
            document.body.appendChild(container);
            await delay();
            expect(this.connectedSpy.calledOnce).to.be.true;
            expect(this.disconnectedSpy.calledOnce).to.be.false;
            container.removeAttribute('simple');
            await delay();
            expect(this.connectedSpy.calledOnce).to.be.true;
            expect(this.disconnectedSpy.calledOnce).to.be.true;
            container.setAttribute('simple', '');
            await delay();
            expect(this.connectedSpy.calledTwice).to.be.true;
            expect(this.disconnectedSpy.calledOnce).to.be.true;
            container.remove();
            await delay();
            expect(this.connectedSpy.calledTwice).to.be.true;
            expect(this.disconnectedSpy.calledTwice).to.be.true;
    
            this.connectedSpy.resetHistory();
            this.disconnectedSpy.resetHistory();
        });
    
        it('should connect to multiple nodes', async function() {
            const container = document.createElement('div');
            container.setAttribute('simple', '');
            container.innerHTML = `
                <p simple>paragraph</p>
                <span simple>
                    <input simple type='text'/>
                    <ul simple>
                        <li>test-1</li>
                        <li simple>test-2</li>
                    </ul>
                </span>
            `;
            document.body.appendChild(container);
            await delay();
            expect(this.connectedSpy.callCount).to.be.equal(6);
            container.querySelector('li[simple]').remove();
            await delay();
            expect(this.connectedSpy.callCount).to.be.equal(6);
            expect(this.disconnectedSpy.callCount).to.be.equal(1);
            container.querySelector('ul[simple]').removeAttribute('simple');
            await delay();
            expect(this.connectedSpy.callCount).to.be.equal(6);
            expect(this.disconnectedSpy.callCount).to.be.equal(2);
            container.remove();
            await delay();
            expect(this.connectedSpy.callCount).to.be.equal(6);
            expect(this.disconnectedSpy.callCount).to.be.equal(6);
    
            this.connectedSpy.resetHistory();
            this.disconnectedSpy.resetHistory();
        });
    
    });
});