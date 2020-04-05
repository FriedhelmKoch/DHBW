// hello_world.ts
class Inner {                               //klasse
    str: string = "hello";                  //string
    msg: any = "world";                     //was es auch ist
    arr: number[] = [1,2];                  //number array
    foo: number|string = "zeichen";         //union  
    wert!: number;                          //nicht initialisiert!
    JaNein: boolean = false;                //boolean Wahrheitswert

    result(): any {                          
        if (this.wert < 10 ) {
            return this.arr[0] * this.wert;
        } else {
            return this.arr[1] * this.wert;
        }
    }

}
var obj = new Inner()

console.log(obj);                   //Inner {str: "hello", msg: "world", arr: Array(2), foo: "zeichen", wert: 1}

obj.foo = 58;
let priv: string = `Ich bin ${obj.foo} Jahre alt.`;  //template sring
console.log(priv);                  //Ich bin 58 Jahre alt.
console.log(obj.foo);               //58

console.log(obj.str);               //hello
console.log(obj.msg);               //world
console.log(typeof obj.str);        //string
console.log(typeof obj.arr[0]);     //number
console.log(obj.arr[0]);            //1
console.log(obj.result());          //NaN

obj.wert = 20;
console.log(obj.wert);              //20
console.log(obj.result());          //40

let a = [10, "hello"];
let b = a[0], c = a[1];
console.log('b : ' + b);    //b:10
console.log('c : ' + c);    //c:hello
