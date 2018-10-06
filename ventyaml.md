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

La syntaxe *ventyaml* permet aussi de comparer plusieur modèles de ventilateurs et de poumons.

	Ventilateurs:
	  - PressureControler
	  - FlowControler

	Poumons:
	  - SimpleLung
	  - RLung

## Valeurs par défault

Lorsque le modèle de ventilateur, le modèle de poumon ou les données 
a afficher sont ommis, des valeurs par défault sont utilisés. Celles-ci sont:

- Ventilateur *PressureControler*
- Poumon *SimpleLung*
- Courbe *Pao - Temps*

## Ventilateur

## Poumon

## Courbe

## Boucle

## Legende
