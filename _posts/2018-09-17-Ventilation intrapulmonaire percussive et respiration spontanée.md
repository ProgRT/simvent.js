---
title: Ventilation intrapulmonaire percussive superposée à la respiration spontanée d'un patient
---

<script>

	var lung = new sv.SptLung();
	var ventilator = new sv.IPV();
	var data = ventilator.ventilate(lung);

	fx = function(d){return d.time};
	fy2 = function(d){return d.Pao};


	//var graph = gs.quickGraph( null, data.timeData, fx, fy2).setidx("Temps").setidy("Pression");
	var graph = new gs.graph();
	graph.padH = 1;
	graph.setscale(data.timeData, fx, fy2)
	.tracer(data.timeData, fx, fy2);
	graph.setidx('Temps (s)');
	graph.setidy('Pression (cmH₂O)');

	function pointer(x, y, texte){
			  var arrLength = 6;
			  var textSpacing = 1;

			  graph.vecteur(x, y + arrLength, x, y);
			  graph.etiquette(x, y + arrLength + textSpacing, texte);
	}

	pointer(5.1, 10, 'Inspiration');
	pointer(6.1, 14, 'Expiration');
	
</script>
