import { defineMatcher } from '../src';
import { delay } from './utils';

describe('defineMatcher()', function() {
    describe("AttributeObserver", function() {
        before(function() {
            const attrSpy = this.attrSpy = sinon.spy();
            defineMatcher('[attr-observer]', class AttrObserverMatcher {
                static get observedAttributes() {
                    return ["watch", "test"];
                }
                attributeChangedCallback(...args) {//attr, oldV, newV
                    attrSpy(...args);
                }
            });
        });
    
        it('should catch changes of attributes', async function() {
            const container = document.createElement('div');
            container.setAttribute('attr-observer', '');
            container.setAttribute('watch', 'watchv');
            document.body.appendChild(container);
            await delay();
            expect(this.attrSpy.callCount).to.be.equal(0);

            container.setAttribute('watch', 'watchv-1');
            await delay();
            expect(this.attrSpy.callCount).to.be.equal(1);
            let [argName, argOld, argNew] = this.attrSpy.getCall(0).args;
            expect(argName).to.be.equal('watch');
            expect(argOld).to.be.equal('watchv');
            expect(argNew).to.be.equal('watchv-1');
            this.attrSpy.resetHistory();

            container.removeAttribute('watch');
            await delay();
            expect(this.attrSpy.callCount).to.be.equal(1);
            [argName, argOld, argNew] = this.attrSpy.getCall(0).args;
            expect(argName).to.be.equal('watch');
            expect(argOld).to.be.equal('watchv-1');
            expect(argNew).to.be.equal(undefined);
            this.attrSpy.resetHistory();

            container.setAttribute('test', 'testv');
            await delay();
            expect(this.attrSpy.callCount).to.be.equal(1);
            [argName, argOld, argNew] = this.attrSpy.getCall(0).args;
            expect(argName).to.be.equal('test');
            expect(argOld).to.be.equal(undefined);
            expect(argNew).to.be.equal('testv');
            this.attrSpy.resetHistory();

            container.remove();
        });
    
    });
});