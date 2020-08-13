const fastify = require('fastify')({ logger: true });
const path = require('path');
const fs = require('fs');
const puppeteer = require('puppeteer');
const opener = require('opener');

const port = process.env.PORT || 3000;
const myArgs = process.argv.slice(2)[0];
const viewPort = {
    desktop: { width: 1200, height: 800 },
    tablet: { width: 700, height: 800 },
    mobile: { width: 500, height: 800 }
}[myArgs ? myArgs : 'desktop'];
const mimeType = {
    '.ico': 'image/x-icon',
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.json': 'application/json',
    '.css': 'text/css',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.wav': 'audio/wav',
    '.mp3': 'audio/mpeg',
    '.svg': 'image/svg+xml',
    '.pdf': 'application/pdf',
    '.doc': 'application/msword',
    '.eot': 'application/vnd.ms-fontobject',
    '.ttf': 'application/font-sfnt'
};

let fails = 0;
let browser;

console.time('Tests');

fastify.register(require('fastify-static'), {
    root: path.join(__dirname, '/')
});

fastify.get('*', (request, reply) => {
    const defaultPathname = path.join(__dirname, 'index.html');
    const sanitizePath = path
        .normalize(request.url || '')
        .replace(/^(\.\.[\/\\])+/, '');
    let pathname = path.join(__dirname, sanitizePath);

    // If s a directory, then look for index.html
    if (!fs.existsSync(pathname) || fs.statSync(pathname).isDirectory()) {
        pathname = defaultPathname;
    }

    const ext = path.parse(pathname).ext;
    reply.header('Content-Type', mimeType[ext] || 'text/html');
    reply.sendFile(path.resolve(__dirname, pathname));
});

fastify.listen(port, async (err) => {
    if ( err ) {
        fastify.log.error(err);
        process.exit(1);
    }

    fastify.log.info(`server is listening on ${fastify.server.address().port}`);

    if (myArgs === 'browser') {
        opener(`http://localhost:${port}/tests/index.html`);
    } else {
        browser = await puppeteer.launch({
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const page = await browser.newPage();
        // Enable Javascript coverage
        await page.coverage.startJSCoverage();
        await page.evaluateOnNewDocument(() => { window.isNodeTests = true; });
        await page.setViewport(viewPort);
        page.on('console', async (msg) => {
            if (msg.text() === 'Tests ended') {
                // Disable Javascript coverage
                const jsCoverage = await page.coverage.stopJSCoverage();
                // coverage(jsCoverage); // TODO coverage if nyc does not work
                closeApp();
            } else if (msg.text().startsWith('Tests failures')) {
                fails = parseInt(msg.text().replace('Tests failures: ', ''));
            } else {
                const type = msg.type() === 'warning' ? 'warn' : msg.type();
                console[type](msg.text());
            }
        });
        await page.goto(`http://localhost:${port}/tests/index.html`);
    }
});

async function closeApp() {
    await browser.close();
    console.log('Closing server...');
    fastify.close().then(() => {
        console.log('Server close!!!');
        console.timeEnd('Tests');
        fails > 0 ? process.exit(1) : process.exit(0);
    }, (err) => {
        console.log('an error happened', err);
    });

    // Force close server afetr 5 secs
    setTimeout(e => {
        console.log('Forcing server close!!!', e);
        process.exit(1);
    }, 5000);
}