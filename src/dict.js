console.log(navigator.language);
var dict = {
	Crs:{
		long:{
			en:"Respiratory system compliance",
			fr:"Compliance du système respiratoire"
		 },
		short:{
			en:"C<sub>rs</sub>",
			fr:"C<sub>sr</sub>"
		 }
	},
	Fiph:{
		long:{
			en:"Phasitron input flow (high)",
			fr:"Débit d'entrée du phasitron (haut)"
		 },
		short:{
			en:"V\'<sub>iph</sub>",
			en:"V\'<sub>eph</sub>",
		 }
	},
	Fipl:{
		long:{
			en:"Phasitron input flow (low)",
			fr:"Débit d'entrée du phasitron (bas)"
		 },
		short:{
			en:"V\'<sub>ipl</sub>",
			en:"V\'<sub>epb</sub>",
		 }
	},
	Flung:{
		long:{
			en:"Flow",
			fr:"Débit"
		},
		short:{
			en:"V'<sub>lung</sub>"
		},
		unit: {
			en: "l/s"
		}
	},
	Fop:{
		long:{
			en:"Phasitron output flow",
			fr: "Débit de sortie du phasitron"
		},
		short:{
			en: "V'<sub>po</sub>"	
		}
	},
	Fconv: {
		short:{
			en:"F<sub>conv</sub>"
		},
		long:{
			en:"Convective frequency",
			fr:"Fréquence convective"
		},
		unit:{
			en: "min"
		}
	},
	Fperc: {
		short:{
			en:"F<sub>perc</sub>"
		},
		long:{
			en:"Percussive frequency",
			fr:"Fréquence percussive"
		}
	},
	lowPassFactor: {
		short:{
			en:"lowPass",
			fr:"passeBas"
		},
		long:{
			en:"Low pass filter factor",
			fr:"Facteur de division du filtre passe bas"
		}
	},
	Lung:{
		long: {
			en:"Lung",
			fr:"Poumon"
		}
	 },
	Palv:{
		long:{
			en:"Alveolar presure",
			fr:"Pression alvéolaire"
		},
		short:{
			en:"P<sub>alv</sub>"
		},
		unit: {
			en: "mbar"
		}
	},
	Pao:{
		long:{
			en:"Presure at airway openning",
			fr:"Pression à l'ouverture des voies aériennes"
		},
		short:{
			en: "P<sub>circ.</sub>"	
		},
		unit: {
			en: "mbar"
		}
	},
	Parameters:{
		long: {
			en:"Parameters",
			fr:"Paramètres"
		}
	},
	PCO2 : {
		short: {
			fr: 'PCO₂',
			en: 'PCO₂'
		},
		long: {
			fr: 'PCO₂',
			en: 'PCO₂'
		},
		unit: {
			en: "mmHg"
		}
	},
	PEEP :{
		long : {
			en : "Positive end expiratoy presure",
			fr: "Pression expiratoire positive"
		},
		short : {
			en : "PEEP",
			fr : "PEP"
		}
	},
	Pel:{
		long:{
		},
		short:{
			en:"P<sub>el</sub>"
		},
		unit: {
			en: "mbar"
		}
	},
	Pinspi: {
		long: {
			fr: 'Pression inspiratoire'
		}
	},
	Pmus:{
		long:{
		},
		short:{
			en:"P<sub>mus</sub>"
		},
		unit: {
			en: "mbar"
		}
	},
	rolingAverage: {
		short:{
			en:"N<sub>avg</suv>",
			fr:"N<sub>moy.</suv>"
		},
		long:{
			en:"Roling average (number of values)",
			fr:"Moyenne mobile (nombre de valeurs)"
		}
	},
	Raw:{
		long:{
			en:"Airway resistance",
			fr:"Résistance des voies aériennes"
		 },
		short:{
			en:"R<sub>aw</sub>",
			fr:"R<sub>vr</sub>"
		 }
	},
	Rexp: {
		long: {
			en: "Phasitron expiratory resistance",
			fr: "Résistance expiratoire du phasitron"
		},
		short: {
			en: "R<sub>exp</sub>"
		},
		unit: {
			en: "mbar/l/s"
		}
	},
	Rit:{
		long:{
			en:"Percussive nspiratory time fraction",
			fr:"Fraction de temps inspiratoire percussif"
		 },
		short:{
			en:"T<sub>i</sub>/T<sub>tot.</sub>",
		 }
	},
	Simulator:{
		long: {
			en:"Simulator",
			fr:"Simulateur"
		}
	},
	Tep:{
		long:{
			en:"Percussive expiratory time",
			fr:"Temps expiratoire percussif"
		 },
		short:{
			en:"T<sub>e perc.</sub>",
			fr:"T<sub>e perc.</sub>"
		 }
	},
	Tic:{
		long:{
			en:"Convective inspiratory time",
			fr:"Temps inspiratoire convectif"
		 },
		short:{
			en:"T<sub>i conv.</sub>",
			fr:"T<sub>i conv.</sub>"
		 }
	},
	Tip:{
		long:{
			en:"Percussive inspiratory time",
			fr:"Temps inspiratoire percussif"
		},
		short:{
			en:"T<sub>i perc.</sub>",
			fr:"T<sub>i perc.</sub>"
		}
	},
	Tec:{
		long:{
			en:"Convective expiratory time",
			fr:"Temps expiratoire convectif"
		},
		short:{
			en:"T<sub>e conv.</sub>",
			fr:"T<sub>e conv.</sub>"
		}
	},
	Tramp:{
		long:{
			en:"Presure rise time",
			fr:"Temps de pente"
		},
		short:{
			en:"T<sub>ramp</sub>",
			fr:"T<sub>pente</sub>"
		}
	},
	Tsampl:{
		long:{
			en:"Sampling interval",
			fr:"Intervale d'échantillonnage"
		},
		short:{
			en:"T<sub>sampl</sub>",
			fr:"T<sub>echant.</sub>"
		},
		unit: {
			en: "s"
		}
	},
	Tvent:{
		long:{
			en:"Ventilation duration",
			fr:"Durée de ventilation"
		 },
		short:{
			en:"T<sub>vent</sub>",
		 },
		 unit: {
			en: "s"
		}
	},
	Vabs:{
		long:{
			en:"Absolute volume",
			fr:"Volume absolut"
		},
		short:{
			en: "V<sub>abs</sub>"	
		},
		unit:{
			en: "l"	
		}
	},
	Ventilate:{
		long : {
			en:"Ventilate",
			fr:"Ventiler"
		}
	},
	Vt:{
		long:{
			en:"Tidal volume",
			fr:"Volume courant"
		},
		short:{
				en: "V<sub>t</sub>",
				en: "V<sub>c</sub>"	
		},
		unit:{
			en: "l"	
		}
	},
	Vtip:{
		long:{
			en:"Percussive inspiratory tidal volume",
			fr:"Volume courant percussif inspiré"
		},
		short:{
			en: "V<sub>ti perc.</sub>"	
		},
		unit:{
			en: "l"	
		}
	}
};
