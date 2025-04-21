export const units = {
    Flung: {unit: 'l/m', factor: 60},
    //Flung: {unit: 'l/s', factor: 1},
    PCO2: {unit: 'mmHg', factor: 1},
    Pao: {unit: 'hPa', factor: 1},
    Vte: {unit: 'ml', factor: 1000}
}

const uiFr = {
    Close: 'Fermer',
    'Completed tasks': 'Tâches complétées',
    Cursors: 'Curseurs',
    ESC: 'Échap',
    Lung: 'Poumons',
    'Ongoing tasks': 'Tâches en cours',
    Ventilator: 'Ventilateur',
}
const modelsFr = {
    APRV: 'APRV (PC-VOI)',
    IPV: 'Ventilation perc. (IPV)',
    FlowControler: 'Volume contrôlé (VC-VOI)',
    PressureControler: 'Pression contrôlée (PC-VOI)',
    PressureAssistor: 'Vent. spontanée (PC-VSC)',
    PVCurve: 'Boucle Pression-Volume',
    SimpleLung: 'Compliance linéaire',
    SptLung: 'Ventilation spontanée',
    SygLung: 'Compliance sygmoïde',
    RLung: 'Compl. syg. + hist.',
    VDR: 'Perc. bi-niveau (VDR-4)',
}

const paramsFr = {
    Cycling: 'Cyclage',
    Crs: 'Compl.',
    Flung: 'Débit',
    Fconv: 'Fréq.',
    Ftrig: 'Décl. insp.',
    Palv: 'P alv.',
    Pao: 'P circ.',
    Passist: 'Aide inspi.',
    PCO2: 'CO₂ exp.',
    PEEP: 'PEP',
    Pel: 'P el.',
    Phigh: 'P haute',
    Plow: 'P basse',
    Pstart: 'P début',
    Pmax: 'P max',
    Pstep: 'Incrément',
    Pstop: 'P fin',
    Thigh: 'T haut',
    Tlow: 'T bas',
    Tman: 'Durée',
    Pmus: 'P mus.',
    Ppeak: 'P crête',
    Raw: 'Res.',
    Tcycle: 'T cycle',
    Vfrc: 'V crf',
    Vt: 'Vc',
}
const fr = {
    ...uiFr,
    ...modelsFr,
    ...paramsFr
}

const dictionary = {
    fr: fr
}

export function translate(tag){
    let nl = navigator.language.split('-')[0]; 

    if (nl in dictionary && tag in dictionary[nl]) {
        return dictionary[nl][tag];
    }
    else return tag;
}

export default translate;
