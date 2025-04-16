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

