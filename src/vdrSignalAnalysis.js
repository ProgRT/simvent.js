import {mean} from "https://cdn.jsdelivr.net/npm/d3-array@3/+esm";

export function getPeaks(data, accessor){
	var signal = data.map(accessor);
	var peaks = [];
	for(var i=1; i<data.length; i++){
		if(
			signal[i] > signal[i-1] &&
			signal[i] > signal[i+1] && (
				signal[i] > 1.05 * signal[i-1] ||
				signal[i] > 1.05 * signal[i+1] 
			)
		){
			peaks.push(data[i]);
		}
	}
	return peaks;
}

export function getFlats(data, accessor){
	const signal = data.map(accessor);
	var flats = [];
	for(var i=1; i<signal.length; i++){
		if(
			signal[i] < signal[i-1] &&
			signal[i] < signal[i+1]
		){flats.push(data[i]) }
	}
	return flats;
}

export function analyse(data, label){
	var peaks = getPeaks(data, d=>d.Pao);
	var peaksOfPeaks = getPeaks(peaks, d=>d.Pao);
	var flatsOfPeaks = getFlats(peaks, d=>d.Pao);

  var bascules = [...peaksOfPeaks, ...flatsOfPeaks];
	bascules = bascules.sort((a,b)=>a.time > b.time ? 1 : -1);

	console.log(bascules);
	var plages = bascules.map((b, i, a)=>{
		if (i == 0) {return data.filter(d=>d.time <= b.time)}
		else {
			return data.filter(
				d=>d.time > a[i-1].time &&
				d.time <= b.time
			);
		}
	});

	plages.push(data.filter(d=>d.time > bascules.slice(-1)[0].time));

	const api = analysePlage(plages[1]);
	const ape = analysePlage(plages[2]);

	const delta = {
		peak: api.peak - ape.peak,
		mean: api.mean - ape.mean,
		endMean: api.endMean - ape.endMean
	}

	return {
		insp: analysePlage(plages[1]),
		exp: analysePlage(plages[2]),
		dif: delta,
		label: label
	};
}

export function analysePlage (p, durFin=0.5){
	const Tfin = p[p.length-1].time - durFin;
	const peaks = getPeaks(p, d=>d.Pao);
	const pEnd = p.filter(d=>d.time > Tfin);

	return {
		peak: peaks[peaks.length - 1].Pao,
		mean: mean(p, d=>d.Pao),
		endMean: mean(pEnd, d=>d.Pao),
	};
}

export function tblAnalysis(){
	const params = [
		{id: 'peak', label: 'Crète'},
		{id: 'mean', label: "Moyenne"},
		{id: 'endMean', label: 'Moyenne tardive (0,5 s)'}
	];

	var tbl = document.createElement("table");
	tbl.className = 'table';
	tbl.style.textAlign = "center";

	var thead = document.createElement('thead');
	tbl.append(thead);

	var head1Row = document.createElement("tr");
	var th = document.createElement('th');
	head1Row.append(th);

	for(let a of arguments){
		var th = document.createElement('th');
		th.colSpan = 3;
		th.textContent = a.label;
		head1Row.append(th);
	}
	thead.append(head1Row);

	var headRow = document.createElement("tr");
	var th = document.createElement('th');
	headRow.append(th);
		for(let a of arguments){
			['Insp.', 'Exp.', 'Δ'].map(t=>{
				var th = document.createElement('th');
				th.textContent = t;
				headRow.append(th);
			});
		}
	thead.append(headRow);

	var tbody = document.createElement('tbody');
	tbl.append(tbody);

	// For every parameter p (row)
	params.map(p=>{
		var tr = document.createElement("tr");
		tr.className = "tbla" + p.id + "row";
		var th = document.createElement('th');
		th.style.textAlign = "left";
		th.textContent = p.label;
		tr.append(th);

		// For every analysis a (column group)
		for(let a of arguments){

			// for every time t (cell)
			['insp', 'exp', 'dif'].map(t=>{
				var td = document.createElement('td');
				td.textContent = fmt(a[t][p.id]);
				tr.append(td);
			});
		};
		tbody.append(tr);
	});

	return tbl
}

export function fmt(n){
	return parseFloat(n.toFixed(1)).toLocaleString();
}
