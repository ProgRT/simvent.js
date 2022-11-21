---
title: Documentation
layout: documentation
---

<link rel="stylesheet" href="{{ "/css/ventyaml.css" | prepend: site.baseurl}}" />
## Modèles de ventilateurs

### sv.PressureControler

Générateur de pression (pression constante) déclenché et cyclé par le temps.

    Ventilateur: PressureControler

<table id="PressureControlerDefaults"></table>
<script type='module'>
    import {PressureControler} from "./src/simvent-ventilators.js";

    const pc = new PressureControler();
    const tbl = document.querySelector("#PressureControlerDefaults");

    var headline = `<tr><th>Paramètre</th><th>Val. init.</th><th>Unité</th></tr>`;
    tbl.insertAdjacentHTML('afterbegin', headline);
    for(let p in pc.ventParams){
        let line = `<tr><td>${p}</td><td>${pc[p]}</td><td>${pc.ventParams[p].unit}</td></tr>`;
        tbl.insertAdjacentHTML('beforeend', line);
    }
</script>

### sv.FlowControler

Générateur de débit (débit constant) déclenché et cyclé par le temps.

    Ventilateur: FlowControler

### sv.PressureAssistor

Générateur de pression (pression constante) déclenché et cyclé par le débit.

    Ventilateur: PressureAssistor
    Poumon: SptLung
    Legende: "Ventilation spontanée avec aide inspiratoire"

### sv.IPV

Ventilateur à haute fréquence percussive.

    Ventilateur: IPV
    Poumon: SptLung
    Courbe: Pao
    Legende: "Ventilation à haute fréquence percussive superposée à une respiration spontanée."

### sv.VDR

Ventilateur à haute fréquence percussive biphadique.

    Ventilateur: VDR
    Courbe: Pao

### sv.PVCurve

Manoeuvre pression-volume quasi-statique destinée à mettre en lumière les caractéristiques mécaniques des différents modèles de poumon.

    Ventilateur: PVCurve

## Modèles de poumon

### sv.SimpleLung

Modèle simple de poumon avec une compliance linéaire.

    Ventilateur: PVCurve
    Poumon: SimpleLung
    Boucle:
       x: Palv
       y: Vabs

### sv.SygLung

Modèle de poumon avec une courbe pression-volume de forme sygmoïde.

    Ventilateur: PVCurve
    Poumon: SygLung
    Boucle:
       x: Palv
       y: Vabs

### sv.RLUNG

Modèle de poumon *recrutable*. Sa courbe presion-volume a une forme sygmoïde et présente une hystérèse.

    Ventilateur: PVCurve
    Poumon: RLung
    Boucle:
       x: Palv
       y: Vabs

### sv.SptLung

Modèle de poumon présentant une respiration spontanée et une compliance linéaire.

    Ventilateur: PressureAssistor
    Poumon: SptLung
    Courbes: 
       - Pmus

