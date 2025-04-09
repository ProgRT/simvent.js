import {fmt} from './utils.js';
export function ratio(Ti, Te) {
    if (Ti > Te) {
        let factor = 1/Te;
        let _Ti = factor * Ti;
        return `${fmt(_Ti, 1)}:1`
    }
    else if (Te > Ti) {
        let factor = 1/Ti;
        let _Te = factor * Te;
        return `1:${fmt(_Te, 1)}`
    }
}

export function isExpStart(d, i, arr){
    return d.Pao == 0 && arr[i-1].Pao > 0;
}

export function isExpEnd(d, i, arr){
    return i == arr.length -1;
}

export function expRatio(data){
    let expStart = data.filter(isExpStart);
    let lastExpStart = expStart[expStart.length - 1];

    let expEnd = data.filter(isExpEnd);
    let lastExpEnd = expEnd[expEnd.length - 1];

    if(lastExpStart && lastExpEnd){
        let ratio = lastExpEnd.Flung / lastExpStart.Flung;
        return ratio;
    }
    else return null;
}
