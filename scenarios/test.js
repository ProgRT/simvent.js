import {fmt} from '../src/utils.js';
import {SimpleLung} from '../src/simvent-lungs.js';
import {ratio, expRatio} from '../src/analysis.js';

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
    completed: false
};

const Tbas = {
    title: "Ajustement du T bas",
    instructions: `<p>Régler le Tbas affin que le débit à la fin de l'expiration soit entre 50 et 75 % du débit au début de l'expiration.</p>`,
    test: (data, vent, lung) => {
        let r = expRatio(data);
        return vent.constructor.name == 'APRV' &&
             r > .5 &&
             r < .75;
    },
    resultFn: (data, vent, lung) => {
        let r = expRatio(data);

        let div = document.createElement('div');
        div.innerHTML = `<strong>Ratio : </strong> ${fmt(r, 2)}`;
        return div;
    },
    completed: false
};

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
    completed: false
};

const VT = {
    title: "Ventilation protectrice",
    instructions: `<p>Ajuster un volume courant de <em>300 ml</em></p>`,
    test: (data, vent, lung) => {
        //return true;
        return vent.Vt == 300;
    },
    completed: false
};



export const scenario = {
    title: 'Scenario test',
    intro: "<p>Ce scénario vise à démontrer les fonctionnalités de l'environnement d'apprentissage.</p>",
    tasks: [
        Rinv,
        Rinv,
        Rinv,
        Rinv,
        Rinv,
        Rinv,
        VT,
        Tbas,
    ]
};
