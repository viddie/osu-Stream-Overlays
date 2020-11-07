// ====== Customizable Options ===========
//If enabled, the star amount as an additional bar
let starBarEnabled = false;

let colorCs = "red";
let colorAr = "yellow";
let colorOd = "blue";
let colorHp = "green";
let colorStars = "white";

// =======================================

let socket = createGosuSocket();


let elements = {
	csBar: null,
	csValue: null,
	arBar: null,
	arValue: null,
	odBar: null,
	odValue: null,
	hpBar: null,
	hpValue: null,
	starBar: null,
	starValue: null,
};

loadElementsByIds(elements);


elements.csBar.parentElement.classList.remove("red");
elements.csBar.parentElement.classList.add(colorCs);

elements.arBar.parentElement.classList.remove("yellow");
elements.arBar.parentElement.classList.add(colorAr);

elements.odBar.parentElement.classList.remove("blue");
elements.odBar.parentElement.classList.add(colorOd);

elements.hpBar.parentElement.classList.remove("green");
elements.hpBar.parentElement.classList.add(colorHp);

elements.starBar.parentElement.classList.remove("white");
elements.starBar.parentElement.classList.add(colorStars);



let countTime = 0.6;
let decimalPlaces = 2;
elements.csValue = new CountUp('csValue', 0, 0, decimalPlaces, countTime, { useEasing: true, decimal: "." });
elements.arValue = new CountUp('arValue', 0, 0, decimalPlaces, countTime, { useEasing: true, decimal: "." });
elements.odValue = new CountUp('odValue', 0, 0, decimalPlaces, countTime, { useEasing: true, decimal: "." });
elements.hpValue = new CountUp('hpValue', 0, 0, decimalPlaces, countTime, { useEasing: true, decimal: "." });
elements.starValue = new CountUp('starValue', 0, 0, decimalPlaces, countTime, { useEasing: true, decimal: "." });

if(starBarEnabled){
	elements.starBar.parentElement.parentElement.style.display = "none";
}


socket.onmessage = event => {
  try {
    let data = JSON.parse(event.data);
	let menu = data.menu;
	let play = data.gameplay;
	let menuPP = menu.pp;
	let playPP = play.pp;
	let playHits = play.hits;
	
	let stats = menu.bm.stats;
	
	setDiffValues(stats.CS, stats.AR, stats.OD, stats.HP, stats.SR, stats.fullSR);
	
  } catch (err) { console.log(err); };
};

/*
setTimeout(() => setDiffValues(4, 9.3, 9, 8), 4000);
setTimeout(() => setDiffValues(3.5, 9.1, 8.5, 8), 12000);
setTimeout(() => setDiffValues(4.5, 9.5, 9, 7), 16000);
setTimeout(() => setDiffValues(4, 10.33, 10.44, 10), 20000);
setTimeout(() => setDiffValues(5.33, 10, 10, 10), 30000);

setDiffValues(4, 10.33, 10.44, 10);
*/


function setDiffValues(cs, ar, od, hp, starCurrent, starMax){
	elements.csBar.style.width = mapValue(cs, 7, 0, 100, true)+"%";	
	elements.arBar.style.width = mapValue(ar, 10, 0, 100, true)+"%";
	elements.odBar.style.width = mapValue(od, 10, 0, 100, true)+"%";
	elements.hpBar.style.width = mapValue(hp, 10, 0, 100, true)+"%";
	elements.starBar.style.width = mapValue(starCurrent, starMax, 0, 100, true)+"%";
	
	elements.csValue.update(cs);
	elements.arValue.update(ar);
	elements.odValue.update(od);
	elements.hpValue.update(hp);
	elements.starValue.update(starCurrent);
	
	/*
	csValue.innerText = cs;
	arValue.innerText = ar;
	odValue.innerText = od;
	hpValue.innerText = hp;
	*/
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