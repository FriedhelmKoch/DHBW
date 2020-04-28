import { combineReducers } from 'redux';

import counter from './counter';
import tasks from './tasks';

let reduce = combineReducers({
  counter: counter,
  tasks: tasks
})

/*
function reduce(state, action) {
	if (state === undefined) {
		return {
			counter: counter(undefined, action),
			tasks: tasks(undefined, action)
		}
	} else {
		return {
			counter: counter(state.counter, action),
			tasks: tasks(state.tasks, action)
		}
	}
}
*/

export default reduce;

