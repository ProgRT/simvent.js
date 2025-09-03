//import {exalations} from './deriv.js';
import {getPeaks} from './analysis.js';

export const Ppeak = {
    id: 'Ppeak',
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

export const Vt = {
    id: 'Vt',
    unit: 'l',
    dec: 0,
    updateCodition: (d)=>{
        if(d.length > 2){
            return d.length > 2 && d[d.length-1].Flung > 0 && d[d.length-2].Flung < 0;
        }
    },
    value: data=> {
        return getPeaks(data, d=>d.Vte)
            .map(d=>d.Vte)
            .slice(-1)[0];
    }
}

export const Fratio = {
    id: 'Fratio',
    unit: '',
    dec: 2,
    updateCodition: d=>{
        if (d.length < 3) return false;
        else {
            let last = d[d.length-1];
            let prev = d[d.length-2]
            let prevprev = d[d.length-3]
            return last.Flung > 0 && prev.Flung < 0;
        }
    },
    value: d=>{
        let fend = d[d.length-2].Flung; 
        let flow = d.map(d=>d.Flung);
        let minFlow = Math.min(...flow);
        return fend/minFlow;
    }
}
