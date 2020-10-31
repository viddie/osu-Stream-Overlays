let socket = new ReconnectingWebSocket("ws://127.0.0.1:24050/ws");
socket.onopen = () => console.log("Successfully Connected");
socket.onclose = event => {
  console.log("Socket Closed Connection: ", event);
  socket.send("Client Closed!");
};
socket.onerror = error => console.log("Socket Error: ", error);

let elements = {
	hSliderbreaks: null,
	h0: null,
	h50: null,
	h100: null,
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
	
	elements.hSliderbreaks.innerText = playHits.sliderBreaks;
	elements.h0.innerText = playHits["0"];
	elements.h50.innerText = playHits["50"];
	elements.h100.innerText = playHits["100"];
  } catch (err) { console.log(err); };
};
