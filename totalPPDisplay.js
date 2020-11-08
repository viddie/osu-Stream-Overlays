// =======================================

//If true, removes all plays that were made after the current replay (or when playing, removes all plays made after your highest
// score on the map was made, which is why you should only use this for viewing replays).
//The longer ago the play was, the less accurate the calculation will be
let removeHistorical = true;

//If true, ppHistoricalDrop's value will be overwritten
let autoCalculatePPDrop = 1;
let autoCalculatePPDropScoreCount = 15;
let ppHistoricalDrop = 1;

// =======================================


let fetchUrlScores = "https://osu.ppy.sh/api/get_user_best?k={apiKey}&u={user}&limit=100";
let fetchUrlProfile = "https://osu.ppy.sh/api/get_user?k={apiKey}&u={user}&limit=100";

let socket = createGosuSocket();


let elements = {
	totalPP: null,
	ppDiff: null,
	topRank: null,
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
		console.log("New play started, resetting infos");
		gotScores = false;
		fetchingUserInfo = false;
		waitForUsername = null;
	});
	
	if(menu.state == 2 && gotScores){
		onNewPlayPPValue(playPP.current);
	} else if(!(data.gameplay.name == null || data.gameplay.name == "" || data.gameplay.name == undefined) && !fetchingUserInfo) {
		fetchingUserInfo = true;
		fetchUserInformation(data.gameplay.name, data.menu);
	}
	
	
  } catch (err) { console.log(err); };
};





let waitForUsername = null;
let gotScores = false;
let bestScores = [];
let profile = {};
let currentMapId = -1;
let currentModsNum = -1;

let currentTotalPP = -1;
let currentTotalPPWithoutPlay = -1;
let currentScorePP = -1;
let currentBonusPP = -1;

function fetchUserInformation(username, menu){
	console.log("Starting fetch of user info");
	let fetchUrlScoresReplaced = fetchUrlScores.replace("{user}", username);
	let fetchUrlProfileReplaced = fetchUrlProfile.replace("{user}", username);
	
	//Add api key defined in deps/secret.js
	fetchUrlScoresReplaced = fetchUrlScoresReplaced.replace("{apiKey}", secret.apiKey);
	fetchUrlProfileReplaced = fetchUrlProfileReplaced.replace("{apiKey}", secret.apiKey);
	
	let p1 = fetch(fetchUrlScoresReplaced).then(response => response.json().then(json => { bestScores = json; }));
	let p2 = fetch(fetchUrlProfileReplaced).then(response => response.json().then(json => { profile = json[0]; }));
	Promise.all([p1, p2]).then(() => {
		console.log("Done fetching resources:");
		console.log(bestScores);
		console.log(profile);
		
		currentTotalPP = parseInt(profile.pp_raw);
		currentScorePP = calculateCurrentScorePP(bestScores);
		currentBonusPP = currentTotalPP - currentScorePP;
		
		console.log("Total PP: "+currentTotalPP);
		console.log("Score PP: "+currentScorePP);
		console.log("Bonus PP: "+currentBonusPP);
		
		analyzeHistoricalPPDrop();
		removePlayFromScores(menu.bm.id, menu.mods.num);
		
		currentScorePP = calculateCurrentScorePP(bestScores);
		currentTotalPPWithoutPlay = currentScorePP + currentBonusPP;
		
		console.log("After score removal");
		console.log(bestScores);
		console.log("Total PP: "+currentTotalPPWithoutPlay);
		console.log("Score PP: "+currentScorePP);
		console.log("Bonus PP: "+currentBonusPP);
		
		gotScores = true;
	});
}


function analyzeHistoricalPPDrop(){
	if(!autoCalculatePPDrop){
		return;
	}
	
	let diffSum = 0;
	let last = bestScores.length-1;
	
	for(let i = 0; i < autoCalculatePPDropScoreCount; i++){
		diffSum += bestScores[last - (i+1)].pp - bestScores[last - i].pp;
	}
	
	ppHistoricalDrop = diffSum / autoCalculatePPDropScoreCount;
	console.log("Historical PP Drop: "+ppHistoricalDrop);
}

function calculateCurrentScorePP(scores){
	let sum = 0;
	
	scores.forEach((score, index) => {
		let thisScorePP = Math.pow(0.95, index) * parseInt(score.pp);
		sum += thisScorePP;
	});
	
	return sum;
}

function calculateWithHindsight(ppValue){
	bestScoresCopy = JSON.parse(JSON.stringify(bestScores));
	if(ppValue < bestScoresCopy[99].pp){
		return [currentScorePP, -1];
	}
	
	let indexToInsert = -1;
	
	bestScoresCopy.forEach((score, index) => {
		if(score.pp < ppValue && indexToInsert == -1){
			indexToInsert = index;
		}
	});
	
	
	bestScoresCopy.splice(indexToInsert, 0, { beatmap_id: currentMapId, enabled_mods: currentModsNum, pp: ppValue});
	bestScoresCopy.splice(100, 1);
	return [calculateCurrentScorePP(bestScoresCopy), indexToInsert];
}


function removePlayFromScores(id, modsNum){
	let indexToRemove = -1;
	
	bestScores.forEach((score, index) => {
		if(score.beatmap_id == id && (score.enabled_mods == modsNum || true)){
			indexToRemove = index;
		}
	});
	
	if(indexToRemove != -1){
		let play = bestScores.splice(indexToRemove, 1);
		play = play[0];
		addDummyPlay(bestScores);
		
		if(removeHistorical === true){
			console.log("Removing all plays done after '"+play.date+"'");
			let untilIndex = bestScores.length - 2;
			for(let i = 0; i < untilIndex; i++){
				let otherPlay = bestScores[i]
				if(otherPlay.date > play.date){ //If the iterated play was made after the current replay
					bestScores.splice(i, 1);
					addDummyPlay(bestScores);
					i--;
					untilIndex--;
				}
			}
		}
	}
}

function addDummyPlay(scores){
	scores.push({beatmap_id: -1, pp: scores[scores.length-1].pp - (ppHistoricalDrop / 1)});
}

let noRankClass = "none";
let rankClasses = [
	[1, "top1"],
	[2, "top2"],
	[3, "top3"],
	[10, "top10"],
	[50, "top50"],
	[100, "top100"],
];

function onNewPlayPPValue(ppValue){
	let [scorePP, rank] = calculateWithHindsight(ppValue);
	let currentTotal = currentBonusPP + scorePP;
	console.log("Current total PP ("+ppValue+"): "+currentTotal+" (+"+(currentTotal - currentTotalPPWithoutPlay).toFixed(3)+"pp, #"+(rank+1)+")");
	
	elements.totalPP.innerText = currentTotal.toFixed(0)+"pp";
	
	let ppDiff = (currentTotal - currentTotalPPWithoutPlay);
	let sign = "";
	if(ppDiff >= 0){
		sign = "+";
	}
	elements.ppDiff.innerText = "("+sign+ppDiff.toFixed(0)+"pp)";
	
	elements.topRank.classList.value = "";
	if(rank == -1){
		elements.topRank.innerText = ">#100";
		elements.topRank.classList.add(noRankClass);
	} else {
		elements.topRank.innerText = "#"+(rank+1);
		let rankClass = "";
		for(let i = 0; i < rankClasses.length; i++){
			if(rank+1 <= rankClasses[i][0]){
				rankClass = rankClasses[i][1];
				break;
			}
		}
		elements.topRank.classList.add(rankClass);
	}
}

