export function defaultsTable(obj){
	var target = document.scripts[document.scripts.length -1 ].parentNode;
	var table = document.createElement("table");
	target.appendChild(table);

	var rLine = document.createElement("tr");

	var c1 = document.createElement("th");
	c1.textContent = "Parameter";
	rLine.appendChild(c1);

	var c3 = document.createElement("th");
	c3.textContent = "Default";
	rLine.appendChild(c3);

	var c2 = document.createElement("th");
	c2.textContent = "Unit";
	rLine.appendChild(c2);

	table.appendChild(rLine);

	for(var id in obj){
		var param = obj[id];
		if(param.calculated != true){
			var rLine = document.createElement("tr");

			var c1 = document.createElement("td");
			c1.textContent = id;
			rLine.appendChild(c1);

			var c3 = document.createElement("td");
			c3.textContent = this[id];
			rLine.appendChild(c3);

			var c2 = document.createElement("td");
			c2.textContent = param.unit;
			rLine.appendChild(c2);

			table.appendChild(rLine);
		}
	}
};

function download(objArray) {
    var array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;
    var str = '';
     
    var line = '';
    for (var index in array[0]) {
	    if(line != '') line += '\t '

		    line += index;
    }

    str += line + '\r\n';
    for (var i = 0; i < array.length; i++) {
        var line = '';
        for (var index in array[i]) {
            if(line != '') line += '\t '
         
					line += array[i][index];
			}

			str += line + '\r\n';
	}

	var link = document.createElement('a');
	link.download = 'simvent.dat';
    link.href = 'data:text/tsv;charset=utf-8,' + escape(str);
    document.body.appendChild(link);
    setTimeout(function(){
		 link.click();
		 document.body.removeChild(link);
    }, 66);
}
