// ====== Customizable Options ===========

let fadeInOutEnabled = true;

let urValueEnabled = true;
let perfectHitsEnabled = true;
let perfectHitsInRowEnabled = true;

let pinMaxOnScreen = 15;
let pinFadeoutTimeSeconds = 0.6;
let pinAppearAnimationSeconds = 0.4;


let barHeight = "4px";
let barBorderRadius = "99px";
let pointerExtendUpPixels = "3";

/*
let bar300Color = "blue";
let bar100Color = "green";
let bar50Color = "orange";
let barCenterColor = "white";
*/
let bar300Color = "#00adff";
let bar100Color = "#16ce1c";
let bar50Color = "#e2d211";
let barCenterColor = "white";

// =======================================

let socket = createGosuSocket();


let elements = {
	outerContainer: null,
	
	odBarContainer: null,
	outerOdBar: null,
	odBar300: null,
	odBar100: null,
	odBar50: null,
	odBarCenter: null,
	
	urInfoContainer: null,
	ur: null,
	urValue: null,
	perfectHits: null,
	perfectHitsInRow: null,
};

loadElementsByIds(elements);

let countTime = 0.6;
let decimalPlaces = 2;
elements.urValue = new CountUp('ur', 0, 0, decimalPlaces, countTime, { useEasing: true, decimal: "." });

if(!urValueEnabled){
	elements.ur.style.visibility = "hidden";
}
if(!perfectHitsEnabled){
	elements.perfectHits.style.visibility = "hidden";
}
if(!perfectHitsInRowEnabled){
	elements.perfectHitsInRow.style.visibility = "hidden";
}
if(!urValueEnabled && !perfectHitsEnabled && !perfectHitsInRowEnabled && false){
	elements.urInfoContainer.style.display = "none";
	elements.odBarContainer.style.height = "100%";
}

elements.outerOdBar.style.height = barHeight;

elements.odBar300.style.background = bar300Color;
elements.odBar100.style.background = bar100Color;
elements.odBar50.style.background = bar50Color;
elements.odBarCenter.style.background = barCenterColor;

document.querySelectorAll(".odBar").forEach((item) => {
	item.style.borderRadius = barBorderRadius;
});






let hitArrayIndex = 0;
let doPrint = false;

socket.onmessage = event => {
  try {
    let data = JSON.parse(event.data);
	let menu = data.menu;
	let play = data.gameplay;
	let menuPP = menu.pp;
	let playPP = play.pp;
	let playHits = play.hits;
	
	if(doPrint){
		console.log(data);
		doPrint = false;
	}
	
	
	if(menu.state != 2 && fadeInOutEnabled){
		elements.outerContainer.style.opacity = "0";
	}
	
	
	checkForNewPlay(data, () => {
		pinElements.forEach((item) => {
			if(item != null && item.parentElement != null){
				removePinElement(item);
			}
		});
		perfectHitCount = 0;
		perfectHitsInRow = 0;
		hitArrayIndex = 0;
		elements.outerContainer.style.opacity = "1";
	});
	
	let useOD = menu.bm.stats.OD;
	if(menu.mods.str.indexOf("DT") > -1){
		useOD = menu.bm.stats.memoryOD;
	}
	
	setOdValues(useOD);
	
	let hitErrors = play.hits.hitErrorArray;
	if(hitErrors != null && hitErrors.length > hitArrayIndex){
		addHit(hitErrors[hitErrors.length-1]);
		hitArrayIndex = hitErrors.length;
	}
	
	setUr(play.hits.unstableRate);
	
  } catch (err) { console.log(err); };
};

/*
*/
let maxOdWidth = 533 + (1 / 3);
let pinElements = [];
let perfectHitCount = 0;
let perfectHitsInRow = 0;
let peakHitsInRow = 0;

/*
setOdValues(10);
setUr(68.13112837);

setInterval(() => {
	addHit(getRandomInt(-2, 2));
}, 100, 2000);
*/


function setOdValues(od){
	let width300 = 160 - 12 * od;
	let width100 = 280 - 16 * od;
	let width50  = 400 - 20 * od;
	
	elements.odBar300.style.width = mapValue(width300, maxOdWidth, 0, 100)+"%";
	elements.odBar100.style.width = mapValue(width100, maxOdWidth, 0, 100)+"%";
	elements.odBar50.style.width = mapValue(width50, maxOdWidth, 0, 100)+"%";
	elements.urInfoContainer.style.width = mapValue(width50, maxOdWidth, 0, 100)+"%";
}
function addHit(hitError){
	if(hitError == 0){
		perfectHitsInRow++;
		perfectHitCount++;
		elements.perfectHits.innerText = perfectHitCount;
	} else {
		perfectHitsInRow = 0;
	}
	
	peakHitsInRow = Math.max(peakHitsInRow, perfectHitsInRow);
	elements.perfectHitsInRow.innerText = peakHitsInRow;
	
	let html = '<div class="odBarPointer" style="left: 55%"><img src="resources/odBarPointer.svg" width="100%" height="100%"/></div>';
	let template = document.createElement("div");
	template.innerHTML = html.trim();
	let div = template.firstChild;
	hitError += maxOdWidth / 2;
	div.style.left = mapValue(hitError, maxOdWidth, 0, 100)+"%";
	div.style.top = "-"+pointerExtendUpPixels+"px";
	div.style.animation = "jump "+pinAppearAnimationSeconds+"s";
	outerOdBar.appendChild(div);
	
	pinElements.push(div);
	if(pinElements.length > pinMaxOnScreen){
		let pinElement = pinElements.shift();
		removePinElement(pinElement);
	}
}

function removePinElement(pinElement){
	pinElement.style.animation = "";
	void pinElement.offsetWidth;
	pinElement.style.animation = "fade-out "+pinFadeoutTimeSeconds+"s";
	
	setTimeout(() => {
		if(pinElement.parentElement != null){
			pinElement.parentElement.removeChild(pinElement);
		}
	}, pinFadeoutTimeSeconds*1000 - 50);
}

function setUr(ur){
	elements.urValue.update(ur);
}

function mapValue(current, max, mappedMin, mappedMax, doClamp){
	var percent = current / max;
	var mappedRange = mappedMax - mappedMin;
	
	let value = mappedMin + (mappedRange * percent);
	
	if(doClamp === true){
		value = Math.min(mappedMax, Math.max(mappedMin, value));
	}
	
	return value;
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

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}