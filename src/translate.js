export const units = {
    //Flung: {unit: 'l/m', factor: 60},
    Flung: {unit: 'l/s', factor: 1},
    PCO2: {unit: 'mmHg', factor: 1},
    Pao: {unit: 'hPa', factor: 1},
}

const fr = {
    APRV: 'APRV (PC-VOI)',
    Close: 'Fermer',
    Cursors: 'Curseurs',
    Cycling: 'Cyclage',
    Crs: 'Compl.',
    ESC: 'ÉCHAP',
    Flung: 'Débit',
    FlowControler: 'VC-VOC',
    Fconv: 'Fréq.',
    Ftrig: 'Décl. insp.',
    IPV: 'Ventilation perc. (IPV)',
    Lung: 'Poumons',
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
    PressureControler: 'PC-VOC',
    PressureAssistor: 'PC-VSC',
    PVCurve: 'Boucle Pres.-Vol.',
    Raw: 'Res.',
    SimpleLung: 'Compliance linéaire',
    SptLung: 'Ventilation spontanée',
    SygLung: 'Compliance sygmoïde',
    RLung: 'Compl. syg. + hist.',
    Tcycle: 'T cycle',
    VDR: 'Perc. bi-niveau (VDR-4)',
    Ventilator: 'Ventilateur',
    Vfrc: 'V crf',
    Vt: 'Vc',
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
