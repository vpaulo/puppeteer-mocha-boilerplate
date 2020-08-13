import { showMessage } from '../../src/ShowMessage.js';

describe('showMessage', () => {
    it('Should show message', async () => {
        await testSetContent('<div class="message"></div>');
        const message = document.querySelector('.message');
        expect(message.innerText).to.be.empty;
        showMessage('Hello there!!');
        expect(message.innerText).equals('Hello there!!');
    });
});