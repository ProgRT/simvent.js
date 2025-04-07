import {fmt} from '../src/utils.js';
import {SimpleLung} from '../src/simvent-lungs.js';

const skeleton = {
    title: "",
    instructions: ``,
    test: (data, vent, lung) => {
        return true;
    },
    resultFn: (data, vent, lung) => {
        let div = document.createElement('div');
        return div;
    },
    completed: false
};

function ratio(Ti, Te) {
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

const Rinv = {
    title: "Ratio inversé",
    instructions: `Ajuster le temps inspiratoire et la fréquence afin
    que le ratio inspiration:expiration soir inversé (temps inspiratoire
    > temps expiratoire).`,
    lung: new SimpleLung(),
    test: (data, vent, lung) => {
        return true;
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
    instructions: `Ajuster un volume courant de <em>300 ml</em>`,
    test: (data, vent, lung) => {
        return true;
        return vent.Vt == 300;
    },
    completed: false
};

export const scenario = {
    intro: "Ce scénario vise à démontrer les fonctionnalités de l'environnement d'apprentissage.",
    tasks: [Rinv, VT]
};
