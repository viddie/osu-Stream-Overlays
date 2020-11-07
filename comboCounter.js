// ====== Customizable Options ===========

//If enabled, shows the peak pp count during the play, if the current pp drop below the peak
//let starBarEnabled = false;
let preComboChar = "";
let postComboChar = "";

let fadeInOutEnabled = true;

let highestComboEnabled = true;

// =======================================

let socket = createGosuSocket();


let elements = {
	currentCombo: null,
	currentComboShadow: null,
	highestCombo: null,
};

loadElementsByIds(elements);


if(!highestComboEnabled){
	elements.highestCombo.parentElement.style.display = "none";
}


socket.onmessage = event => {
  try {
    let data = JSON.parse(event.data);
	let menu = data.menu;
	let play = data.gameplay;
	let menuPP = menu.pp;
	let playPP = play.pp;
	let playHits = play.hits;
	
	
	if(menu.state != 2 && fadeInOutEnabled){
		document.body.style.opacity = "0";
	}
	
	checkForNewPlay(data, () => {
		document.body.style.opacity = "1";
	});
	
	setComboValues(play.combo.current, play.combo.max);
	
  } catch (err) { console.log(err); };
};




/*
let combo = 0;
let maxCombo = 1281;
let highestCombo = 0;

setInterval(() => {
	combo++;
	highestCombo = Math.max(highestCombo, combo);
	setComboValues(combo, highestCombo, maxCombo);
	
	if(combo > 1200){
		combo = 0;
	}
}, 100, 2000);
*/

let lastCombo = 0;
function setComboValues(current, highest){
	if(lastCombo != current){
		elements.currentCombo.innerText = preComboChar+current+postComboChar;
		elements.currentComboShadow.innerText = preComboChar+current+postComboChar;
		elements.highestCombo.innerText = preComboChar+highest+postComboChar;
	
		elements.currentComboShadow.style.animation = "";
		void elements.currentComboShadow.offsetWidth;
		elements.currentComboShadow.style.animation = "jump .2s";
		
		elements.currentCombo.style.animation = "";
		void elements.currentCombo.offsetWidth;
		elements.currentCombo.style.animation = "small-jump .2s";
	}
	
	lastCombo = current;
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

let lastCurrentCombo = 0;
let stackedComboValue = 0;

function clickedCircle(comboObj){
	comboObj.current++;
	trackCurrentMaxCombo(comboObj);
	console.log(comboObj);
}
function brokeCombo(comboObj){
	comboObj.current = 0;
	trackCurrentMaxCombo(comboObj);
	console.log(comboObj);
}

function trackCurrentMaxCombo(comboObj){
	let newCurrentCombo = comboObj.current;
	if(newCurrentCombo <= lastCurrentCombo){
		stackedComboValue += lastCurrentCombo+1; //Account for the break that caused the current combo to reset
	}
	
	comboObj.currentMax = stackedComboValue + newCurrentCombo;
	
	lastCurrentCombo = newCurrentCombo;
}