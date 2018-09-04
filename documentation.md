---
title: Documentation
layout: documentation
---

## Modèles de ventilateurs

### sv.PressureControler

Générateur de pression (pression constante) déclenché et cyclé par le temps.

    Ventilateur: PressureControler

<script> new sv.PressureControler().defaultsTable(); </script>

### sv.FlowControler

Générateur de débit (débit constant) déclenché et cyclé par le temps.

    Ventilateur: FlowControler

<script> new sv.FlowControler().defaultsTable(); </script>

### sv.PressureAssistor

Générateur de pression (pression constante) déclenché et cyclé par le débit.

    Ventilateur: PressureAssistor
    Poumon: SptLung
    Legende: "Ventilation spontanée avec aide inspiratoire"

<script> new sv.PressureAssistor().defaultsTable(); </script>

### sv.VDR

Ventilateur à haute fréquence percussive biphadique.

    Ventilateur: VDR
    Courbe: Pao

<script> new sv.VDR().defaultsTable(); </script>

### sv.PVCurve

Manoeuvre pression-volume quasi-statique destinée à mettre en lumière les caractéristiques mécaniques des différents modèles de poumon.

    Ventilateur: PVCurve

<script> new sv.PVCurve().defaultsTable(); </script>

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

<script> ventyamlEverything("pre"); </script>
