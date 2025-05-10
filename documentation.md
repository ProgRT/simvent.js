---
title: Documentation
icon: Livre
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

### APRV

Générateur de pression (pression constante) déclenché et cyclé par le temps.

```{ventyaml}
Ventilateur: APRV
Poumon: 
  Type: SptLung
  Fspt: 29
  Ti: 0.5
Legende: "Mode APRV avec ventilation spontanée superposée."
```

<table id="APRVDefaults"></table>

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

<table id="LungDefaults"></table>
<script type=module>
    import {SimpleLung} from "./src/simvent-lungs.js";
    import {mkListTbl} from "./src/simvent-describe.js";
    
    let trgt = document.querySelector(`#LungDefaults`);
    trgt.innerHTML = mkListTbl(SimpleLung.carbParams);
</script>

### SimpleLung

Modèle simple de poumon avec une compliance linéaire.

    Ventilateur: PVCurve
    Poumon: SimpleLung
    Boucle:
       x: Palv
       y: Vabs

<table id="SimpleLungDefaults"></table>

### SptLung

Modèle de poumon présentant une respiration spontanée. Ses
caractéristiques mécaniques sont identiques au modèle *SimpleLung*.

```{ventyaml}
Ventilateur: PressureAssistor
Poumon: SptLung
Courbes: 
   - Pmus
```

<table id="SptLungDefaults"></table>

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

<script src="{{ "/lib/yaml.min.js" | prepend: site.baseurl}}"></script>

<script type="module">
	import {ventyamlEverything} from "./src/ventyaml.js";
	ventyamlEverything("pre");
</script>

<script type='module'>
    import * as ventilators from "./src/simvent-ventilators.js";
    import * as lungs from "./src/simvent-lungs.js";
    import {mktbl, mkListTbl} from "./src/simvent-describe.js";

    for(let v of Object.keys(ventilators)){
        let tbl = document.querySelector(`#${v}Defaults`);
        tbl.innerHTML = mkListTbl(ventilators[v].ventParams);
    }

    for(let l of Object.keys(lungs)){
        let tbl = document.querySelector(`#${l}Defaults`);
        tbl.innerHTML = mkListTbl(lungs[l].mechParams);
    }

</script>
