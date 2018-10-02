var sj = {
	updateDelay: 1000
};

function inputHandler(){
	if('updateTimeout' in sj){
		clearTimeout(sj.updateTimeout);
	}
	sj.updateTimeout = setTimeout(updateAndSave, sj.updateDelay );
}

function updateAndSave(){
	console.log('Updateandsave');
	if('cm' in myVentyaml){
		myVentyaml.cm.save();
	}
	myVentyaml.update.bind(myVentyaml)();
	localStorage.vyamlSource = myVentyaml.textarea.value;
}

myVentyaml.textarea.addEventListener("input", inputHandler);
//myVentyaml.cm.on("change", inputHandler);
