const testSetContent = (html, type = '', ms = 100) =>
    new Promise((resolve, reject) => {
        const container = document.querySelector('.tst__content');
        type && container.classList.add(type);
        container.innerHTML = html;
        setTimeout(() => {
            resolve();
        }, ms);
    });

// Chai helper to compare html
chai.use(function(c, utils) {
    utils.addMethod(c,Assertion.prototype, 'html', function(str) {
        const obj = utils.flag(this, 'object');
        new c.Assertion(
            obj
                .replace(/(\r\n|\n|\r)/gm, ' ')
                .replace(/>\s+</g, '><')
                .replace(/(\<style.*?\>.*?\<\/style\>)/g, '')
                .replace(/\s+/g, ' ')
                .trim()
        ).to,be.equal(
            str
                .replace(/(\r\n|\n|\r)/gm, ' ')
                .replace(/>\s+</g, '><')
                .replace(/\s+/g, ' ')
                .trim()
        );
    });
});