
export function makeSwipable(id) {
    const elm = document.querySelector(id);

	function unhide(){
        elm.classList.remove('hidden');
    }

	function hide(){
        elm.classList.add('hidden');
    }

	window.addEventListener('swiperight', hide, false);
	window.addEventListener('swipeleft', unhide, false);
}

function touchStartHandler(evt){
    window.touchStartCoord = {
        x: evt.touches[0].screenX,
        y: evt.touches[0].screenY
    }
}

function touchMoveHandler(evt){
    var touchMoveCoord = {
        x: evt.touches[0].screenX,
        y: evt.touches[0].screenY
    }
    var xMove = Math.abs(touchMoveCoord.x - touchStartCoord.x);
    var yMove = Math.abs(touchMoveCoord.y - touchStartCoord.y);

    if(xMove>yMove && touchMoveCoord.x - touchStartCoord.x > 0){
        var newEvent = new Event('swiperight');
        window.dispatchEvent(newEvent);
    }

    if(xMove>yMove && touchMoveCoord.x - touchStartCoord.x < 0){
        var newEvent = new Event('swipeleft');
        window.dispatchEvent(newEvent);
    }
}

window.addEventListener('touchstart', touchStartHandler, false);
window.addEventListener('touchmove', touchMoveHandler, false);
