function inputHandler(e){
		  if(e.key == 'Control'){myVentyaml.ctrlDown = true}
		  if(e.key == 'Enter' && myVentyaml.ctrlDown){
					 updateAndSave();
		  }
}

function inputUp(e){
		  if(e.key == 'Control'){myVentyaml.ctrlDown = false}
}

function updateAndSave(){
	myVentyaml.update.bind(myVentyaml)();
	localStorage.vyamlSource = myVentyaml.textarea.value;
}

myVentyaml.textarea.addEventListener("keydown", inputHandler);
myVentyaml.textarea.addEventListener("keyup", inputUp);
