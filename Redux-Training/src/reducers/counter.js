let initialCount = 0;

function counter(state = initialCount, action) {
	if (action.type == "INCREMENT") {
		return state + 1;
	} else {
		return state;
	}
}

export default counter;
