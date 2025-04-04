const fr = {
    Ventilator: 'Ventilateur',
    Lung: 'Poumons',
    Cursors: 'Curseurs',
}

const dictionary = {
    fr: fr
}

export function translate(tag){
//    let nl = navigator.language; 
    let nl = 'fr';
    if(nl in dictionary) return dictionary[nl][tag];
    else return tag;
}
