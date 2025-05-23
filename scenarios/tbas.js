import {fmt} from '../src/utils.js';
import {SimpleLung, SptLung} from '../src/simvent-lungs.js';
import {APRV} from '../src/simvent-ventilators.js';
import {exalations} from '../src/deriv.js';
//import {plot, line, dot, areaY, tip} from "https://cdn.skypack.dev/@observablehq/plot@0.6.7";

import("https://cdn.skypack.dev/@observablehq/plot@0.6.7").then(r=>window.Plot = r);

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
        let ex = exalations(data).filter(flROk);
        return ex.length > 0;
    },
    resultFn: (data, vent, lung) => {
        let [ex] = exalations(data).filter(flROk).slice(-1);

        let div = document.createElement('div');
        let dat = [
            ['Débit exp. max.', fmt(ex.start.Flung, 2)],
            ['Débit fin exp.', fmt(ex.end.Flung, 2)],
            ['Ratio', fmt(ex.flowRatio, 2)]
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
    vent: new APRV(),
};

function eFlowPlt(dat){
    let [ex] = exalations(dat).filter(flROk).slice(-1);

    let es = ex.start;
    let ee = ex.end;
    let fMax = es.Flung;
    let fMin = ee.Flung;

    dat = dat.filter((d, i, a)=>d.time > ex.start.time - 2)

    return Plot.plot({
        width: 350,
        height: 200,
        grid: true,
        x: {label: 'Temps (s)'},
        y: {label: 'Débit (%)', reverse: true, tickFormat: d=>`${d} %`},
        marks: [
            Plot.line(dat, {x: "time", y: d=>100 * d.Flung/fMax}),
            Plot.dot([ex.start, ex.end], {
                x: 'time',
                y:d=>100 * d.Flung/fMax,
                stroke:'red',
                tip: true,
            }),
        ],
    });
}

function flROk(d){
    return d.flowRatio >= .5 && d.flowRatio <= .75;
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
