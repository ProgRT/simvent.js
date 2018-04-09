---
title: Courbe volume-pression du modèle sv.SygLung
---
<svg id="svg1{{ page.id | replace: "/", "" }}" class="square surface"></svg>

<script>

	var lung = new sv.SygLung();

	function sf(a, b){
		return a.Palv - b.Palv;
	}
	var ventilator = new sv.PVCurve();
	var data = ventilator.ventilate(lung).timeData;
	data = data.sort(sf);

	fx = function(d){return d.Palv};
	fy1 = function(d){return d.Vt};


	var graph1 = gs.quickGraph( "#svg1{{ page.id | replace: "/", "" }}", data, fx, fy1)
		.setidx("Palv")
		.setidy("Vt");


</script>
