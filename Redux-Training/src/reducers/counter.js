let initialState = 0;

function counter(state = initialState, action) {
	if (action.type === "INCREMENT") {
		return state + 1;
	} else {
		return state;
	}
}

export default counter;
