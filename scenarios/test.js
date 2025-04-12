import {fmt} from '../src/utils.js';
import {SimpleLung, SptLung} from '../src/simvent-lungs.js';
import {APRV} from '../src/simvent-ventilators.js';
import {ratio, expRatio, isExpStart, isExpEnd} from '../src/analysis.js';
import {plot, line, dot, areaY} from "https://cdn.skypack.dev/@observablehq/plot@0.6";

const skeleton = {
    title: "",
    instructions: ``,
    test: (data, vent, lung) => {
        return true;
    },
    resultfn: (data, vent, lung) => {
        let div = document.createelement('div');
        return div;
    },
};


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

        let pltConf = {
            width: 200,
            height: 200,
            x: {label: 'Temps (s)', line: true},
            y: {grid: true},
            marks: [
                line(data, {x: "time", y: "Flung"}),
                dot([es, ee], {x: 'time', y:'Flung', stroke:'red'})
            ],
        };
        let plt = plot(pltConf);

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
const Rinv = {
    title: "Ratio inversé",
    instructions: `<p>Ajuster le temps inspiratoire et la fréquence afin
    que le ratio inspiration:expiration soir inversé (temps inspiratoire
    > temps expiratoire).</p>`,
    test: (data, vent, lung) => {
        //return true;
        return vent.Ti > vent.Te;
    },
    resultFn: (data, vent, lung) => {
        let div = document.createElement('div');
        div.innerHTML = `
            <strong>T<small>cycle</small> : </strong> ${vent.Tcycle} s
            <strong>T<small>i</small> : </strong>${vent.Ti} s 
            <strong>T<small>e</small> : </strong> ${vent.Tcycle - vent.Ti} s
            <strong>Ratio :</strong> ${ratio(vent.Ti, vent.Te)}`;
        return div;
    },
};

const VT = {
    title: "Ventilation protectrice",
    instructions: `<p>Ajuster un volume courant de <em>300 ml</em></p>`,
    lung: new SptLung(),
    test: (data, vent, lung) => {
        //return true;
        return vent.Vt == 300;
    },
};

export const scenario = {
    title: 'Scenario test',
    lung: new SimpleLung({Raw: 10}),
    vent: new APRV(),
    intro: "<p>Ce scénario vise à démontrer les fonctionnalités de l'environnement d'apprentissage.</p>",
    tasks: [
        //Rinv,
        //VT,
        Tbas,
    ]
};
