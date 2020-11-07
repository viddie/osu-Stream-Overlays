
function createGosuSocket(){
	let socket = new ReconnectingWebSocket("ws://127.0.0.1:24050/ws");
	socket.onopen = () => console.log("Successfully Connected");
	socket.onclose = event => {
	  console.log("Socket Closed Connection: ", event);
	  socket.send("Client Closed!");
	};
	socket.onerror = error => console.log("Socket Error: ", error);
	return socket;
}


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



let _checkLastState = -1;
let _checkLastMillis = -1;
let _checkLastMapId = -1;
let _checkIgnoreMillisChange = false;

function checkForNewPlay(data, callback){
	let currentMillis = data.menu.bm.time.current;
	let newState = data.menu.state;
	let newMapId = data.menu.bm.id;
	
	//console.log("State: "+_checkLastState+" -> "+newState+" |  Time: "+_checkLastMillis+" -> "+currentMillis+" |  Map: "+_checkLastMapId+" -> "+newMapId);
	
	if(_checkLastMapId != newMapId){
		_checkIgnoreMillisChange = true;
	}
	
	if(newState == 2 && _checkLastState != 2){
		callback();
	} else if(_checkLastMillis > currentMillis && (_checkLastMillis != 0 || currentMillis > 0)){
		if(_checkIgnoreMillisChange){
			_checkIgnoreMillisChange = false;
		} else {
		callback();
		}
	}
	
	_checkLastMapId = newMapId;
	_checkLastMillis = currentMillis;
	_checkLastState = newState;
}

function getSongName(data){
	let metadata = data.menu.bm.metadata;
	return metadata.artist +" - " + metadata.title + "[" + metadata.difficulty + "]";
}