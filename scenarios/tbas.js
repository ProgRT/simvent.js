import {fmt} from '../src/utils.js';
import {SimpleLung, SptLung} from '../src/simvent-lungs.js';
import {APRV} from '../src/simvent-ventilators.js';
//import {ratio, expRatio, isExpStart, isExpEnd} from '../src/analysis.js';
import {plot, line, dot, areaY, tip} from "https://cdn.skypack.dev/@observablehq/plot@0.6.7";

const Tbas = {
    title: "Ajustement du T bas",
    instructions: `
    <p>L'une des particularité de cette approche est d'utiliser la
    diminution du débit lors de l'expiration pour estimer le rapport entre
    la déformation (<em>strain</em>) dynamique et la déformation totale du
    poumon (statique + dynamique). Les tenants de cette approche
    recommandent d'ajuster le temps de pression basse (T <sub>bas</sub>)
    afin que le débit à la fin de l'expiration soit égal à 50 à 75 % du
    débit expiratoire de pointe, limitant ainsi la déformation dynamique à
    50 % de la déformation totale.</p>

    <p>Régler le T<sub>bas</sub> affin que le débit à
    la fin de l'expiration (V'<sub>fin exp</sub>) soit entre 50 et 75
    % du débit au début de l'expiration (V'<sub>exp max</sub>).</p>

    <math display='block'>
        <mn>0,5</mn>
        <mo>&lt</mo>
        <mfrac>
            <mi>V'<sub>fin exp</sub></mi>
            <mn>V'<sub>exp max</sub></mi>
        </mfrac>
        <mo>&lt</mo>
        <mn>0,75</mn>
    </math>
    `,
    test: (data, vent, lung) => {
        let r = expRatio(data);
        return vent.constructor.name == 'APRV' &&
             r > .5 &&
             r < .75;
    },
    resultFn: (data, vent, lung) => {
        let [es] = data.filter(isExpStart).slice(-1);
        let [ee] = data.filter(isExpEnd).slice(-1);
        let r = expRatio(data);

        let div = document.createElement('div');
        let dat = [
            ['Débit exp. max.', fmt(es.Flung, 2)],
            ['Débit fin exp.', fmt(ee.Flung, 2)],
            ['Ratio', fmt(r, 2)]
        ]

        div.append(dataDisplay(dat));
        div.append(eFlowPlt(data));
        return div;
    },
};

export const scenario = {
    title: 'Ventilation adaptative en temps contrôlé',
    intro: `<details open><summary>Introduction</summary><p>Ce scénario vise à vous familiariser avec l'approche
    <em>Time Controled Adaptative Ventilation (TCAV)</em>. Cette
    approche de la <em>VCRP</em> promue entre autre par
    <em>Nieman</em> et <em>Habashi</em> met l'emphase sur le
    recrutement alvéolaire et la prévention de l'atélectasie, ainsi
    que sur la prévention de atélectrauma par la limitation de la
    déformation dynamique du poumon.</p>
    </details>`,
    tasks: [Tbas],
    lung: new SimpleLung({Raw: 15, Crs: 20}),
    vent: new APRV({Tlow: 1}),
};

function eFlowPlt(dat){
    let [es] = dat.filter(isExpStart).slice(-1);
    let [ee] = dat.filter(isExpEnd).slice(-1);
    let r = expRatio(dat);
    let etip = `V'fin exp: ${fmt(ee.Flung, 2)} l/s\nRatio: ${fmt(r,2)}`;
    let stip = `V'exp max: ${fmt(es.Flung, 2)} l/s`;
    dat = dat.filter((d, i, a)=>d.time > es.time - 2)

    return plot({
        width: 350,
        height: 200,
        grid: true,
        x: {label: 'Temps (s)'},
        y: {label: 'Débit (l/s)'},
        marks: [
            line(dat, {x: "time", y: "Flung"}),
            dot([es, ee], {x: 'time', y:'Flung', stroke:'red'}),
            tip([stip], {x: es.time, dx: 1, y: es.Flung, anchor: 'right', dx: -7}),
            tip([etip], {x: ee.time, y: ee.Flung, anchor: 'left', dx: 7}),
        ],
    });
}

function dataDisplay(arr){
    const container = document.createElement('div');
    container.className = 'dataDisplay';
    for (let dat of arr){
        let ctn = document.createElement('div');
        ctn.innerHTML = `
        <span><strong>${dat[0]} : </strong></span>
        <span>${dat[1]}</span>
        `;
        container.append(ctn);
    }
    return container;
}
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

