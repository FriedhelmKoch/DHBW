let kartendeck = {
    farben: ["Herz", "Piek", "Kreuz", "Karo"],
    karten: Array(52),
    createAuswahlKarte: function() {
        return () => {
            var auswahlKarte = Math.floor(Math.random() * 52);  //Zufallswert
            var auswahlFarben = Math.floor(auswahlKarte / 13);
            return {farben: this.farben[auswahlFarben], karte: auswahlKarte % 13};
        }
    }
}
let auswahl = kartendeck.createAuswahlKarte();
let wahl = auswahl(); 
console.log("Karte: " + wahl.karte + " in " + wahl.farben);
