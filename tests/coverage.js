function coverage(jsCoverage) {
    let totalBytes = 0;
    let usedBytes = 0;
    let report = {};
    const coverage = jsCoverage.filter(entry => entry.url.includes('/src/'));

    report['All pages'] = {};

    for (const entry of coverage) {
        totalBytes += entry.text.length;
        let singleUsedBytes = 0;
        for (const range of entry.ranges) {
            usedBytes += range.end - range.start - 1;
            singleUsedBytes += range.end - range.start - 1;
        }

        let singleUnusedBytes = 100 - (singleUsedBytes / entry.text.length * 100);

        report[entry.url] = {};
        report[entry.url]['Total bytes'] = entry.text.length;
        report[entry.url]['Used bytes'] = `${singleUsedBytes} - ${Number((singleUsedBytes / entry.text.length * 100).toFixed(1))}%`;
        report[entry.url]['Unused bytes'] = `${entry.text.length - singleUsedBytes} - ${Number(singleUnusedBytes.toFixed(1))}%`; 
    }

    report['All pages']['Total bytes'] = totalBytes;
    report['All pages']['Used bytes'] = `${usedBytes} - ${Number((usedBytes / totalBytes * 100).toFixed(1))}%`;
    report['All pages']['Unused bytes'] = `${totalBytes - usedBytes} - ${Number((100 - (usedBytes / totalBytes * 100)).toFixed(1))}%`;

    console.table(report);
}

module.exports = coverage;