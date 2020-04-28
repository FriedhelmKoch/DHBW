class Kombiniere<T> {
    wert: T;
    add: (x: T, y: T) => T;     //Lambda Operator (ergibt sich zu)
                                //Kurzschreibweise für anonymen Funktionsaufruf
}
let KombiString = new Kombiniere<string>();
KombiString.wert = "Hallo ";
KombiString.add = function(x, y) { return x + y; };
console.log(KombiString.add(KombiString.wert, "DHBW")); //Hallo DHBW

let KombiNumber = new Kombiniere<number>();
KombiNumber.wert = 2;
KombiNumber.add = function(x, y) { return x + y; };
console.log(KombiNumber.add(KombiNumber.wert, 3));      //5
