---
title: Documentation
icon: livre.svg
layout: documentation
---

* Table des matières
{:toc}

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

```{ventyaml}
Ventilateur: IPV
Poumon: SptLung
Courbe: Pao
Legende: "Ventilation à haute fréquence percussive superposée à une respiration spontanée."
```

<table id="IPVDefaults"></table>

### VDR

Ventilateur à haute fréquence percussive biphadique.

```{ventyaml}
Ventilateur: VDR
Courbe: Pao
```

<table id="VDRDefaults"></table>

### PVCurve

Manoeuvre pression-volume quasi-statique destinée à mettre en lumière les caractéristiques mécaniques des différents modèles de poumon.

```{ventyaml}
Ventilateur: PVCurve
```

<table id="PVCurveDefaults"></table>

## Modèles de poumon

Les différents modèles de poumons partagent les mêmes caractéristiques
en ce qui a trait à la concentration de CO₂ dans l'air expiré et son
évolution au cours de l'expiration.

```{ventyaml}
Ventilateur:
  Mode: PVCurve
  Pmax: 10

Boucle:
   x: Vte
   y: PCO2
```
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

    var headline = `
    <thead>
        <tr><th>Paramètre</th><th>Val. init.</th><th>Unité</th></tr>
    </thead>
   `;

    const ventlist = [
        'PressureControler',
        'FlowControler',
        'PressureAssistor',
        'IPV',
        'VDR',
        'PVCurve'
    ];

    const lunglist = [
        'SimpleLung',
        'SygLung',
        'RLung',
        'SptLung',
    ];

    function mktbl(obj, list){
        var tblcontent = headline;
        for(let p in obj[list]){
            if(!obj[list][p].calculated){
                tblcontent += `<tr><td>${p}</td><td>${obj[p]}</td><td>${obj[list][p].unit|| ''}</td></tr>
                `;
            }
        }
        return tblcontent;
    }

    for(let v of ventlist){
        let vent = new ventilators[v];
        let tbl = document.querySelector(`#${v}Defaults`);
        tbl.innerHTML = mktbl(vent, "ventParams");
    }

    for(let l of lunglist){
        let lung = new lungs[l];
        let tbl = document.querySelector(`#${l}Defaults`);
        tbl.innerHTML = mktbl(lung, "mechParams");
    }

</script>
