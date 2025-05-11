export * from './ui.js';

export function fmt(num, dec) {
    let conf = {maximumFractionDigits: dec};
    if (isNaN(num)) return '';
    else return num.toLocaleString(navigator.language, conf);
}

export function delta(curs1, curs2){
    let curs3 = {};
    let keys = Object.keys(curs1);
    for (let k of keys) {
        curs3[k] = curs2[k] - curs1[k];
    }
    return curs3;
}

export function ratio(c1, c2){
    let c3 = {};
    let keys = Object.keys(c1);
    for (let k of keys) {
        c3[k] = c2[k] / (Math.abs(c1[k])>1e-2?c1[k]:0);
        // console.log(`Dénominateur de ${k}: ${c1[k]}`)
    }
    return c3;
}

export function toCsv(dat){
    let hLine = Object.keys(dat[0]).join(',');
    let dLines = dat.map(obj => Object.values(obj).join(',')).join('\n');
    return hLine + '\n' + dLines;
}

export function csvUrl(data){
    let csv = toCsv(data);
    return URL.createObjectURL(new Blob([csv]))
}
