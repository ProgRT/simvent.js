---
title: Epace mort anatomique (méthode de Fowler)
---

<script type=module>
    import {SimpleLung} from "{{site.baseurl}}/src/simvent-lungs.js";
    import {PressureControler} from "{{site.baseurl}}/src/simvent-ventilators.js";
    import {quickGraph} from "https://progrt.github.io/graphsimple.js/graphsimple.js";
    import * as Plot from "https://cdn.skypack.dev/@observablehq/plot@0.6";
    
	var lung      = new SimpleLung();
	var vent      = new PressureControler();
	vent.nbcycles = 1;
	vent.Tsampl   = .001;
	var data      = vent.ventilate(lung).timeData
        .filter(d=>d.time < vent.Ti + vent.Te);

	//var graph = new quickGraph(null, data, d=>1000*d.Vte, d=>d.PCO2)
	//	.setidx("Volume expiré (ml)")
	//	.setidy("PCO₂ (mmHg)")
	//	.plagex(0, lung.Vdaw * 1000, "Espace mort", 20)
	//	.pointx(lung.Vdaw * 1000);

    document.body.append(
        Plot.plot({
            marks: [
             Plot.line(data, {x: "Vte", y: "PCO2"})
             ]
        })
    );
</script>
