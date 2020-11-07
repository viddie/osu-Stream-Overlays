// ====== Customizable Options ===========
//If enabled, displays a skull at the left hand side of the HP bar when the player failed the play. Can be used to track if a player would have passed the map when they played with no-fail
let skullEnabled = true;



// =======================================

let socket = createGosuSocket();


let hadFailed = false;
let ignoreUntilFull = false;

let elements = {
	hpBarOuter: null,
	hpBarInner: null,
	skull: null,
};

loadElementsByIds(elements);

socket.onmessage = event => {
  try {
    let data = JSON.parse(event.data);
	let menu = data.menu;
	let play = data.gameplay;
	let menuPP = menu.pp;
	let playPP = play.pp;
	let playHits = play.hits;
	
	
	checkForNewPlay(data, () => {
		hadFailed = false;
		ignoreUntilFull = true;
	});
	
	
	if(menu.state != 2){
		elements.hpBarOuter.style.transform = "translate(0, -500%)";
		elements.hpBarOuter.style.top = "0";
	} else {
		elements.hpBarOuter.style.transform = "";
		elements.hpBarOuter.style.top = "50px";
	}
	
	elements.hpBarInner.style.width = (100 - (play.hp.normal / 2))+"%";
	
	if(play.hp.normal == 200){
		ignoreUntilFull = false;
	}
	
	if(play.hp.normal == 0 && menu.state == 2 && !ignoreUntilFull){
		hadFailed = true;
	}
	
	if(hadFailed && !ignoreUntilFull && skullEnabled){
		elements.skull.style.visibility = "visible";
	} else {
		elements.skull.style.visibility = "hidden";
	}
	
  } catch (err) { console.log(err); };
};
