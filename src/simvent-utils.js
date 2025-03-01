export function parseParams (defaults, parameters=null){
    let params = {...defaults, ...parameters};

    for (let param in defaults) {
        this[param] = params[param];
    }

    if (this.debugMode == true) {
        for (let p in parameters) {
            if (!defaults.hasOwnProperty(p)) console.log(p, " is inkonwn");
        }
    }
}

