/**
 * This reporter is based on:
 * https://mochajs.org/api/reporters_base.js.html
 * https://mochajs.org/api/reporters_spec.js.html
 */

const colors = {
    pass: 90,
    fail: 31,
    'bright pass': 92,
    'bright fail': 91,
    'bright yellow': 93,
    pending: 36,
    suite: 0,
    'error title': 0,
    'error message': 31,
    'error stack': 90,
    checkmark: 32,
    fast: 90,
    medium: 33,
    slow: 31,
    green: 32,
    light: 90,
    'diff gutter': 90,
    'diff added': 32,
    'diff removed': 31,
};
const symbols = {
    ok: '✓',
    err: '✖',
    dot: '․',
    comma: ',',
    bang: '!'
};
const stats = {
    suites: 0,
    tests: 0,
    passes: 0,
    pending: 0,
    failures: 0
};

const failures = [];
const color = (type, str) => `\u001b[${colors[type]}m${str}\u001b[0m`;
const format = (ms) => {
    const s = 1000;
    const m = s * 60;
    if (ms >= m) {
        return `${Math.round(ms / m)}m`;
    }
    if (ms >= s) {
        return `${Math.round(ms / s)}s`;
    }
    return `${ms}ms`;
};
const listFailures = () => {
    console.log();
    failures.forEach((test, i) => {
        // Format
        const fmt =
            color('error title', `  ${i + 1}) ${test.title}:\n`) +
            color('error message', `     ${test.err.message}`) +
            color('error stack', `\n${test.err.stack}\n`);
        console.log(fmt);
    });
};

const epilogue = () => {

    let fmt;
    console.log();
    // passes
    fmt =
        color('bright pass', ' ') +
        color('green', ` ${stats.passes || 0} passing`) +
        color('light', ` (${format(stats.duration)})`);
    console.log(fmt);
    // pending
    if (stats.pending) {
        fmt = color('pending', ' ') + color('pending', ` ${stats.pending} pending`);
        console.log(fmt);
    }

    // failures
    if (stats.failures) {
        fmt = color('fail', `  ${stats.failures} failing`);
        console.log(fmt);
        listFailures();
        console.log();
    }
    console.log();
};

export function TST(runner) {
    let indents = 0;
    let n = 0;
    const indent = () => Array(indents).join('  ');

    runner.on('start', () => {
        stats.start = new Date();
        console.log();
    });
    runner.on('suite', suite => {
        ++indents;
        stats.suites = stats.suites || 0;
        suite.root || stats.suites++;
        console.log(color('suite', `${indent()}${suite.title}`));
    });
    runner.on('suite end', () => {
        --indents;
        if (indents === 1) {
            console.log();
        }
    });
    runner.on('test end', () => {
        stats.tests = stats.tests || 0;
        stats.tests++;
    });
    runner.on('pending', test => {
        stats.pending++
        const fmt = indent() + color('pending', `  - ${test.title}`);
        console.log(fmt);
    });
    runner.on('pass', test => {
        stats.passes = stats.passes || 0;
        stats.passes++;
        let fmt;
        let speed = '';
        if (test.duration > test.slow()) {
            speed = 'slow';
        } else if (test.duration > test.slow() / 2) {
            speed = 'medium';
        } else {
            speed = 'fast';
        }
        if (test.speed === 'fast') {
            fmt =
                indent() +
                color('checkmark', `  ${symbols.ok}`) +
                color('pass', ` ${test.title}`);
            console.log(fmt);
        } else {
            fmt =
                indent() +
                color('checkmark', `  ${symbols.ok}`) +
                color('pass', ` ${test.title}`) +
                color(speed, ` (${test.duration})`);
            console.log(fmt);
        }
    });
    runner.on('fail', (test, err) => {
        stats.failures = stats.failures || 0;
        stats.failures++;
        console.log(indent() + color('fail', `  ${++n}) ${test.title}`));
        test.err = err;
        failures.push(test);
    });
    runner.once('end', () => {
        stats.end = new Date();
        stats.duration = stats.end - stats.start;
        epilogue();
    });
}