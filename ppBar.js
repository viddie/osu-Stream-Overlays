let socket = new ReconnectingWebSocket("ws://127.0.0.1:24050/ws");
socket.onopen = () => console.log("Successfully Connected");
socket.onclose = event => {
  console.log("Socket Closed Connection: ", event);
  socket.send("Client Closed!");
};
socket.onerror = error => console.log("Socket Error: ", error);


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
  } catch (err) { console.log(err); };
};





