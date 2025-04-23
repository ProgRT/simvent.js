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

export function getPeaks(data, accessor){
	var signal = data.map(accessor);
	var peaks = [];
	for(var i=1; i<data.length; i++){
		if(
			signal[i] > signal[i-1] &&
			signal[i] > signal[i+1] && (
				signal[i] > 1.05 * signal[i-1] ||
				signal[i] > 1.05 * signal[i+1] 
			)
		){
			peaks.push(data[i]);
		}
	}
	return peaks;
}

export function getFlats(data, accessor){
	const signal = data.map(accessor);
	var flats = [];
	for(var i=1; i<signal.length; i++){
		if(
			signal[i] < signal[i-1] &&
			signal[i] < signal[i+1]
		){flats.push(data[i]) }
	}
	return flats;
}

