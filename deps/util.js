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
