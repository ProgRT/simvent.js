---
title: Documentation
layout: documentation
---

<link rel="stylesheet" href="{{ "/css/ventyaml.css" | prepend: site.baseurl}}" />
## Modèles de ventilateurs

### PressureControler

Générateur de pression (pression constante) déclenché et cyclé par le temps.

```{ventyaml}
Ventilateur: PressureControler
```

<table id="PressureControlerDefaults"></table>

### FlowControler

Générateur de débit (débit constant) déclenché et cyclé par le temps.

```{ventyaml}
Ventilateur: FlowControler
```

<table id="FlowControlerDefaults"></table>

### PressureAssistor

Générateur de pression (pression constante) déclenché et cyclé par le débit.

```{ventyaml}
Ventilateur: PressureAssistor
Poumon: SptLung
Legende: "Ventilation spontanée avec aide inspiratoire"
```

<table id="PressureAssistorDefaults"></table>

### IPV

Ventilateur à haute fréquence percussive.

    Ventilateur: IPV
    Poumon: SptLung
    Courbe: Pao
    Legende: "Ventilation à haute fréquence percussive superposée à une respiration spontanée."

<table id="IPVDefaults"></table>

### VDR

Ventilateur à haute fréquence percussive biphadique.

    Ventilateur: VDR
    Courbe: Pao

<table id="VDRDefaults"></table>

### PVCurve

Manoeuvre pression-volume quasi-statique destinée à mettre en lumière les caractéristiques mécaniques des différents modèles de poumon.

    Ventilateur: PVCurve

<table id="PVCurveDefaults"></table>

## Modèles de poumon

### SimpleLung

Modèle simple de poumon avec une compliance linéaire.

    Ventilateur: PVCurve
    Poumon: SimpleLung
    Boucle:
       x: Palv
       y: Vabs

<table id="SimpleLungDefaults"></table>

### SygLung

Modèle de poumon avec une courbe pression-volume de forme sygmoïde.

    Ventilateur: PVCurve
    Poumon: SygLung
    Boucle:
       x: Palv
       y: Vabs

<table id="SygLungDefaults"></table>

### RLung

Modèle de poumon *recrutable*. Sa courbe presion-volume a une forme sygmoïde et présente une hystérèse.

```{ventyaml}
Ventilateur: PVCurve
Poumon: RLung
Boucle:
   x: Palv
   y: Vabs
```

<table id="RLungDefaults"></table>

### SptLung

Modèle de poumon présentant une respiration spontanée et une compliance linéaire.

```{ventyaml}
Ventilateur: PressureAssistor
Poumon: SptLung
Courbes: 
   - Pmus
```

<table id="SptLungDefaults"></table>

<script type='module'>
    import * as ventilators from "./src/simvent-ventilators.js";
    import * as lungs from "./src/simvent-lungs.js";

    const ventlist = [
        'PressureControler',
        'FlowControler',
        'PressureAssistor',
        'IPV',
        'VDR',
        'PVCurve'
    ];

    for(let v of ventlist){
        let vent = new ventilators[v];
        let tbl = document.querySelector(`#${v}Defaults`);

        var headline = `<tr><th>Paramètre</th><th>Val. init.</th><th>Unité</th></tr>`;
        tbl.insertAdjacentHTML('afterbegin', headline);
        for(let p in vent.ventParams){
            if(!vent.ventParams[p].calculated){
                let line = `<tr><td>${p}</td><td>${vent[p]}</td><td>${vent.ventParams[p].unit|| ''}</td></tr>`;
                tbl.insertAdjacentHTML('beforeend', line);
            }
        }
    }

    const lunglist = [
        'SimpleLung',
        'SygLung',
        'RLung',
        'SptLung',
    ];

    for(let l of lunglist){
        let lung = new lungs[l];
        let tbl = document.querySelector(`#${l}Defaults`);

        var headline = `<tr><th>Paramètre</th><th>Val. init.</th><th>Unité</th></tr>`;
        tbl.insertAdjacentHTML('afterbegin', headline);
        for(let p in lung.mechParams){
            if(!lung.mechParams[p].calculated){
                let line = `<tr><td>${p}</td><td>${lung[p]}</td><td>${lung.mechParams[p].unit|| ''}</td></tr>`;
                tbl.insertAdjacentHTML('beforeend', line);
            }
        }
    }
</script>
