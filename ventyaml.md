---
layout: documentation
---

<link rel='stylesheet' href='css/ventyamldoc.css'/>
Syntaxe *ventyaml*
==================

*Une langage informatique pour parler de ventilation mécanique*

La syntaxe *ventyaml* permet de décrire simplement une scène de ventilation mécanique.
On entend par une scène un modèle *x* de ventilateur ventilant un modèle *x* de poumon et l'affichage d'une ou plusieur données tirées des résultats de cette simulation.

	Ventilateur: PressureControler
	Poumon: SimpleLung
	Courbe: Flung

La syntaxe *ventyaml* permet aussi de comparer plusieur modèles de ventilateurs.

	Ventilateurs:
	  - PressureControler
	  - FlowControler

Ou de poumons.

	Poumons:
	  - SimpleLung
	  - RLung

Lorsque le modèle de ventilateur, le modèle de poumon ou les données 
a afficher sont ommis, des valeurs par défault sont utilisés. Celles-ci sont:

- Ventilateur *PressureControler*
- Poumon *SimpleLung*
- Courbe *Pao - Temps*

## Poumons

	Poumons:
	  - Raw: 5
	    Crs: 50
	  - Raw: 10
	    Crs: 20
