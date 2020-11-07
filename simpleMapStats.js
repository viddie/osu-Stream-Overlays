let socket = new ReconnectingWebSocket("ws://127.0.0.1:24050/ws");
socket.onopen = () => console.log("Successfully Connected");
socket.onclose = event => {
  console.log("Socket Closed Connection: ", event);
  socket.send("Client Closed!");
};
socket.onerror = error => console.log("Socket Error: ", error);


let elements = {
	time: null,
	bpm: null,
	
	starsNow: null,
	starsMax: null,
	cs: null,
	ar: null,
	od: null,
	hp: null,
	
	song: null,
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
	
	let beatmap = menu.bm;
	
	elements.starsNow.innerText = beatmap.stats.SR+"*";
	elements.starsMax.innerText = beatmap.stats.fullSR+"*";
	
	elements.cs.innerText = beatmap.stats.CS;
	elements.ar.innerText = beatmap.stats.AR;
	elements.od.innerText = beatmap.stats.OD;
	elements.hp.innerText = beatmap.stats.HP;
	
	let millis = beatmap.time.mp3 - beatmap.time.firstObj;
	let seconds = millis / 1000;
	let minutes = Math.floor(seconds / 60);
	seconds %= 60;
	
	elements.time.innerText = minutes.toFixed(0)+":"+seconds.toFixed(0);
	
	let bpmString = "";
	if(beatmap.stats.BPM.min == beatmap.stats.BPM.max){
		bpmString = beatmap.stats.BPM.min;
	} else {
		bpmString = beatmap.stats.BPM.min + "-" + beatmap.stats.BPM.max;
	}
	
	elements.bpm.innerText = bpmString;
	
	
	elements.song.innerText = getSongName(data);
	
	
  } catch (err) { console.log(err); };
};
