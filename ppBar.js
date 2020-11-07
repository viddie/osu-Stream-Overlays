// ====== Customizable Options ===========
//If enabled, shows the peak pp count during the play, if the current pp drop below the peak
let peakBarEnabled = true;

//If enabled, shows bars for 99%, 98%, 97% and 95% FCs
let accBarsEnabled = true;

//If enabled, shows the maximum possible amount of pp you can achieve during the current play. (Not always correctly working)
let maxBarEnabled = true;


// =======================================

let socket = createGosuSocket();


let elements = {
	ppSS: null,
	ppIfFc: null,
	ppMaxThisPlay: null,
	ppCurrent: null,
	
	ppBarIfFc: null,
	ppBarMaxThisPlay: null,
	ppBarCurrent: null,
	ppBar99: null,
	ppBar98: null,
	ppBar97: null,
	ppBar95: null,
	
	ppBarPeak: null,
	ppPeak: null,
};

loadElementsByIds(elements);

let lastPeak = -1;
let isInPlay = false;
let peakMapId = -1;
let peakUpdateCount = 0;
let peakUpdateCountMin = 20;

socket.onmessage = event => {
  try {
    let data = JSON.parse(event.data);
	let menu = data.menu;
	let play = data.gameplay;
	let menuPP = menu.pp;
	let playPP = play.pp;
	let playHits = play.hits;
	
	
	if(menu.state == 2){
		if(!isInPlay){
			lastPeak = -1;
			isInPlay = true;
			peakMapId = menu.bm.id;
		}
	} else {
		isInPlay = false;
	}
	
	
	
	
	elements.ppSS.innerText = menuPP["100"];
	elements.ppIfFc.innerHTML = playPP.fc+" <span class=\"label\">FC</span>";
	elements.ppMaxThisPlay.innerHTML = playPP.maxThisPlay+" <span class=\"label\">Max</span>";
	elements.ppCurrent.innerText = playPP.current;
	
	elements.ppBar99.style.height = (mapValue(menuPP["99"], menuPP["100"], 3, 97))+"%";
	elements.ppBar98.style.height = (mapValue(menuPP["98"], menuPP["100"], 3, 97))+"%";
	elements.ppBar97.style.height = (mapValue(menuPP["97"], menuPP["100"], 3, 97))+"%";
	elements.ppBar95.style.height = (mapValue(menuPP["95"], menuPP["100"], 3, 97))+"%";
	
	elements.ppBarIfFc.style.height = (mapValue(playPP.fc, menuPP["100"], 3, 97))+"%";
	elements.ppBarMaxThisPlay.style.height = (mapValue(playPP.maxThisPlay, menuPP["100"], 3, 97))+"%";
	elements.ppBarCurrent.style.height = (mapValue(playPP.current, menuPP["100"], 3, 97))+"%";
	
	if(playHits["100"] == 0 && playHits["50"] == 0 && playHits["0"] == 0 && playHits.sliderBreaks == 0){
		elements.ppBarMaxThisPlay.style.visibility = "hidden";
		elements.ppBarIfFc.style.visibility = "hidden";
	} else if(playHits["0"] == 0 && playHits.sliderBreaks == 0){
		elements.ppBarMaxThisPlay.style.visibility = "visible";
		elements.ppBarIfFc.style.visibility = "hidden";
	} else {
		elements.ppBarMaxThisPlay.style.visibility = "visible";
		elements.ppBarIfFc.style.visibility = "visible";
	}
	
	
	if(playPP.current >= lastPeak || menu.bm.id != peakMapId){
		lastPeak = playPP.current;
		elements.ppBarPeak.style.visibility = "hidden";
		peakUpdateCount = 0;
	} else {
		peakUpdateCount++;
		elements.ppBarPeak.style.height = (mapValue(lastPeak, menuPP["100"], 3, 97))+"%";
		elements.ppPeak.innerText = lastPeak;
		if(peakUpdateCount > peakUpdateCountMin){
			elements.ppBarPeak.style.visibility = "visible";
		}
	}
	
	
	if(!peakBarEnabled){
		elements.ppBarPeak.style.visibility = "hidden";
	}
	if(!accBarsEnabled){
		elements.ppBar99.style.visibility = "hidden";
		elements.ppBar98.style.visibility = "hidden";
		elements.ppBar97.style.visibility = "hidden";
		elements.ppBar95.style.visibility = "hidden";
	}
	if(!maxBarEnabled){
		elements.ppBarMaxThisPlay.style.visibility = "hidden";
	}
  } catch (err) { console.log(err); };
};





