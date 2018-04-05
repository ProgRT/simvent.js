---
title: Capnogramme volumétrique
---
<svg id="svg{{ page.id | replace: "/", "" }}" class="square"></svg>

	<svg id="svg{{ page.id | replace: "/", "" }}" class="square"></svg>


	<script>

		var lung = new sv.SimpleLung();
		var ventilator = new sv.PresureControler();
		ventilatorventilator.nbcycles = 1;
		var data = ventilator.ventilate(lung).timeData;

		fx = function(d){return d.Vte};
		fy2 = function(d){return d.PCO2};


		var graph = gs.quickGraph( "#svg{{ page.id | replace: "/", "" }}", data, fx, fy2)
			.setidx("Vte")
			.setidy("PCO2");

	</script>

<script>

	var lung = new sv.SimpleLung();
	var ventilator = new sv.PressureControler();
	ventilator.nbcycles = 1;
	ventilator.Tsampl = .001;
	var data = ventilator.ventilate(lung);

	fx = function(d){return d.Vte};
	fy2 = function(d){return d.PCO2};


	var graph = gs.quickGraph( "#svg{{ page.id | replace: "/", "" }}", data.timeData, fx, fy2)
		.setidx("Vte")
		.setidy("PCO2");

</script>
