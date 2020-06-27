import { v4 as uuidv4 } from 'uuid';  // https://www.npmjs.com/package/uuid

let initialState = [
  {id: uuidv4(), title: "Gauloises am Kiosk kaufen"},
  {id: uuidv4(), title: "Kona Extra Fancy nicht vergessen!"}
];

function tasks(state = initialState, action) {
	if (action.type === "TASK_ADD") {
		let maxTaskId = 0;
		for(let task of state) {
			if (task.id > maxTaskId) {
				maxTaskId = task.id;
			}
		}
		return [].concat(state, [
				{id: uuidv4(), title: action.title}
		])
	}
  return state;
}

export default tasks;
