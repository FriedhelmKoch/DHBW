export function incrementCounter() {
  return {type: "INCREMENT"};
}
export function addTask(title) {
  return {type: "TASK_ADD", title: title};
}
