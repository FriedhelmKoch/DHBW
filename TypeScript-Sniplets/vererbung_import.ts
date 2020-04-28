import {Tier} from './module';

class Schlange extends Tier { 
    constructor(name: string) { 
      super(name);  //'super-Methode' ruft den Konstruktor der Basisklasse 
                    //Tier auf und übergibt den Wert name. Damit geht die 
                    //vererbte Version nicht verloren.
    }
    move(km = 6) {
      console.log("Sie schlängelt...");
      super.move(km);
    }
    beine: number = 0;
}
  
class Pferd extends Tier {
    constructor(name: string) { super(name); }
    move(km = 36) {
      console.log("Es galoppiert...");
      super.move(km);
    }
    beine: number = 4;
}
  
let sch: Tier = new Schlange("Eine Schlange");
let pfd: Tier = new Pferd("Ein Pferd");
  
sch.move();
pfd.move(34);
