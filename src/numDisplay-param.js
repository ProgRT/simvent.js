import {exalations} from './deriv.js';
import {getPeaks} from './vdrSignalAnalysis.js';
export const Vt = {
    label: 'Vt',
    unit: 'l',
    dec: 0,
    updateCodition: (d)=>{
        return true;
        if(d.length > 2){
            return d[d.length-1].Flung > 0 && d[d.length-2].Flung < 0;
        }
    },
    //value: data=> data[data.length-2].Vte,
    value: data=> {
        return getPeaks(data, d=>d.Vte)
            .map(d=>d.Vte)
            .slice(-1)[0];
    }
}

export const Ppeak = {
    label: 'Ppeak',
    unit: 'cm H₂O',
    updateCodition: d=>{
        if (d.length < 3) return false;
        else {
            let last = d[d.length-1];
            let prev = d[d.length-2]
            let prevprev = d[d.length-3]
            return prev.Pao > last.Pao && prev.Pao >= prevprev.Pao;
        }
    },
    value: d=> d[d.length-2].Pao
}
