import {fmt} from '../src/utils.js';
import {SimpleLung, SptLung} from '../src/simvent-lungs.js';
import {APRV} from '../src/simvent-ventilators.js';
//import {ratio, expRatio, isExpStart, isExpEnd} from '../src/analysis.js';
import {plot, line, dot, areaY, tip} from "https://cdn.skypack.dev/@observablehq/plot@0.6.7";

export function isExpStart(d, i, arr){
    return d.Pao == 0 && arr[i-1].Pao > 0;
}

export function isExpEnd(d, i, arr){
    return i < arr.length - 2 && d.Pao == 0 && arr[i+1].Pao > 0;
}

export function expRatio(data){
    let expStart = data.filter(isExpStart);
    let lastExpStart = expStart[expStart.length - 1];

    let expEnd = data.filter(isExpEnd).filter((d,i,a)=>i==a.length-1);
    let lastExpEnd = expEnd[expEnd.length - 1];

    if(lastExpStart && lastExpEnd){
        let ratio = lastExpEnd.Flung / lastExpStart.Flung;
        return ratio;
    }
    else return null;
}
const Tbas = {
    title: "Ajustement du T bas",
    instructions: `<p>Régler le T<sub>bas</sub> affin que le débit à la fin de
    l'expiration (V'<sub>fin exp</sub>) soit entre 50 et 75 % du débit au
début de l'expiration (V'<sub>exp max</sub>).</p>`,
    test: (data, vent, lung) => {
        let r = expRatio(data);
        return vent.constructor.name == 'APRV' &&
             r > .5 &&
             r < .75;
    },
    resultFn: (data, vent, lung) => {
        let [es] = data.filter(isExpStart).filter((d, i, a)=>i == a.length - 1);
        let [ee] = data.filter(isExpEnd).filter((d, i, a)=>i == a.length - 1);
        let r = expRatio(data);

        let plt = plot({
            width: 350,
            height: 200,
            grid: true,
            x: {label: 'Temps (s)'},
            y: {label: 'Débit (l/s)', grid: true},
            marks: [
                line(data, {x: "time", y: "Flung"}),
                dot([es, ee], {x: 'time', y:'Flung', stroke:'red'}),
                tip([`V'exp max: ${fmt(es.Flung, 2)} l/s`], {x: es.time, y: es.Flung, anchor: 'right'}),
                tip([`V'fin exp: ${fmt(ee.Flung, 2)} l/s\nRatio: ${fmt(r,2)}`], {x: ee.time, y: ee.Flung, anchor: 'left'}),
            ],
        });

        let div = document.createElement('div');
        div.innerHTML = `
            <strong>Débit exp. max. : </strong> ${fmt(es.Flung, 2)}
            <strong>Débit fin exp. : </strong> ${fmt(ee.Flung, 2)}
            <strong>Ratio : </strong> ${fmt(r, 2)}
        `
        ;
        div.append(plt);
        return div;
    },
    completed: false
};

export const scenario = {
    title: 'Ventilation adaptative en temps contrôlé',
    lung: new SimpleLung({Raw: 10}),
    vent: new APRV(),
    intro: `<p>Vise à vous familiariser avec l'approche <em>Time Controled Adaptative Ventilation (TCAV)</em>.</p>`,
    tasks: [Tbas]
};
