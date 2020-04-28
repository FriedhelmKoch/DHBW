let user1: Symbol = Symbol("key");
let user2: Symbol = Symbol("key");

let object = {};

object[user1] = function() {
    return "xyz";
}
console.log(object[user1]());
