let socket = new ReconnectingWebSocket("ws://127.0.0.1:24050/ws");
socket.onopen = () => console.log("Successfully Connected");
socket.onclose = event => {
  console.log("Socket Closed Connection: ", event);
  socket.send("Client Closed!");
};
socket.onerror = error => console.log("Socket Error: ", error);


let elements = {
	hpBarOuter: null,
	hpBarInner: null,
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
	
	if(menu.state != 2){
		elements.hpBarOuter.style.transform = "translate(0, -500%)";
		elements.hpBarOuter.style.top = "0";
	} else {
		elements.hpBarOuter.style.transform = "";
		elements.hpBarOuter.style.top = "50px";
	}
	
	elements.hpBarInner.style.width = (100 - (play.hp.normal / 2))+"%";
	
  } catch (err) { console.log(err); };
};
