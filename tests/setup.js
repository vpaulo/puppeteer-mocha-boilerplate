import { TST } from './reporter.js';

if (window.isNodeTests) {
    mocha.reporter(TST);
}

mocha.suite.beforeAll('Before', () => {
    console.log('Starting Tests');
});
mocha.suite.afterEach('After each', () => {
    const container = document.querySelector('.tst__content');
    // Clean test container
    container.innerHTML = '';
    // Clean class
    container.classList.remove('no-fixed', 'full-width');
});

mocha.run(failures => {
    console.log('Tests failures: ', failures);
}).on('end', () => {
    console.log('Tests ended');
});
