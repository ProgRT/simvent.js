---
---
## Modèles de ventilateurs

### sv.PressureControler

    Ventilateur: PressureControler

Générateur de pression (pression constante) déclenché et cyclé par le temps.

<script> new sv.PressureControler().defaultsTable(); </script>

### sv.FlowControler

    Ventilateur: FlowControler

Générateur de débit (débit constant) déclenché et cyclé par le temps.

<script> new sv.FlowControler().defaultsTable(); </script>

### sv.PressureAssistor

    Ventilateur: PressureAssistor
    Poumon: SptLung
    Legende: "Ventilation spontanée avec aide inspiratoire"

Générateur de pression (pression constante) déclenché et cyclé par le débit.

<script> new sv.PressureAssistor().defaultsTable(); </script>

### sv.VDR

    Ventilateur: VDR
    Courbe: Pao

Ventilateur à haute fréquence percussive biphadique.

<script> new sv.VDR().defaultsTable(); </script>

### sv.PVCurve

    Ventilateur: PVCurve

Manoeuvre pression-volume quasi-statique destinée à mettre en lumière les caractéristiques mécaniques des différents modèles de poumon.

<script> new sv.PVCurve().defaultsTable(); </script>

## Modèles de poumon

### sv.SimpleLung

    Ventilateur: PVCurve
    Poumon: SimpleLung
    Boucle:
       x: Palv
       y: Vabs

Modèle simple de poumon avec une compliance linéaire.

### sv.SygLung

    Ventilateur: PVCurve
    Poumon: SygLung
    Boucle:
       x: Palv
       y: Vabs

Modèle de poumon avec une courbe pression-volume de forme sygmoïde.

### sv.RLUNG

    Ventilateur: PVCurve
    Poumon: RLung
    Boucle:
       x: Palv
       y: Vabs

Modèle de poumon *recrutable*. Sa courbe presion-volume a une forme sygmoïde et présente une hystérèse.

### sv.SptLung

    Ventilateur: PressureAssistor
    Poumon: SptLung
    Courbes: 
       - Pmus

Modèle de poumon présentant une respiration spontanée et une compliance linéaire.
