let socket = new ReconnectingWebSocket("ws://127.0.0.1:24050/ws");
socket.onopen = () => console.log("Successfully Connected");
socket.onclose = event => {
  console.log("Socket Closed Connection: ", event);
  socket.send("Client Closed!");
};
socket.onerror = error => console.log("Socket Error: ", error);



let pp = new CountUp('pp', 0, 0, 0, .5, { useEasing: true, useGrouping: true, separator: " ", decimal: "." })
let h100 = new CountUp('h100', 0, 0, 0, .5, { useEasing: true, useGrouping: true, separator: " ", decimal: "." })
let h50 = new CountUp('h50', 0, 0, 0, .5, { useEasing: true, useGrouping: true, separator: " ", decimal: "." })
let h0 = new CountUp('h0', 0, 0, 0, .5, { useEasing: true, useGrouping: true, separator: " ", decimal: "." })
let elements = {
	all: null,
	
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
	
	
	hSliderbreaks: null,
	h0: null,
	h50: null,
	h100: null,
	
	ur: null,
	gradeNow: null,
	gradeMax: null,
	hpNormal: null,
	hpSmooth: null,
	
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
	
	
	
	elements.hSliderbreaks.innerText = playHits.sliderBreaks;
	elements.h0.innerText = playHits["0"];
	elements.h50.innerText = playHits["50"];
	elements.h100.innerText = playHits["100"];
	
	elements.ur.innerText = playHits.unstableRate;
	elements.gradeNow.innerText = playHits.grade.current;
	elements.gradeMax.innerText = playHits.grade.maxThisPlay;
	elements.hpNormal.innerText = play.hp.normal;
	elements.hpSmooth.innerText = play.hp.smooth;
	
	elements.hpBarInner.style.width = (100 - (play.hp.normal / 2))+"%";
	
	elements.all.innerText = event.data;
  } catch (err) { console.log(err); };
};





function mapValue(current, max, mappedMin, mappedMax){
	var percent = current / max;
	var mappedRange = mappedMax - mappedMin;
	
	return mappedMin + (mappedRange * percent);
}

function loadElementsByIds(elements, parent=null){
    if(parent === null){
        for(var field in elements){
            elements[field] = document.getElementById(field);
        }
    } else {
        for(var field in elements){
            elements[field] = parent.querySelector("#"+field);
        }
    }
}