class Wohnung {
    zimmer: number = 0;
    groesse: number = 0;
    balkon: boolean = false;
    kosten: number = 15;

    preis(): number {
        if(this.balkon) {
            return ((this.kosten * this.groesse) + (0.15 * this.zimmer)) + (0.1 * (this.kosten * this.groesse) + (0.15 * this.zimmer));
        } 
        else {
            return (this.kosten * this.groesse) + (0.15 * this.zimmer);
        }
    }    
}

let Wohnung1: Wohnung = new Wohnung();
Wohnung1.balkon = true;
Wohnung1.groesse = 85;
Wohnung1.zimmer = 4;

let Wohnung2: Wohnung = new Wohnung();
Wohnung2.balkon = false;
Wohnung2.groesse = 85;
Wohnung2.zimmer = 4;

console.log(Wohnung1.preis());
console.log(Wohnung2.preis());
