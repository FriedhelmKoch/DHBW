//  Notifications 

// Hier wird die generelle Erlaubnis eingeholt
if (Notification.permission !== "granted") {

    //Falls noch keine Berechtigung besteht wird diese auf Klick eingeholt
    $('#request-permission').click(function(e){ 
      //Berechtigung anfordern
      Notification.requestPermission(function(result) {  
        if (result == 'denied') {
          //Notifications wurden blockiert
          alert("Ohne wird die Demo nicht funktionieren! :-(");
            return;
          } else if (result == 'default') {
          //Dialog wurde weggeklickt
          alert("Nicht einfach wegklicken! Akzeptieren! ;-)");
          return;
        }
        //Zeige Demo Inhalte an       
        $('#demo-content').show();
        $('#request-permission').hide();
  
      });
    });
  
  } else {
        //Es bereits die Erlaubnis fÃ¼r Notifications
        $('#demo-content').show();
        $('#request-permission').hide();
  }

  // Klick Event zur Simplen Demo hinzufÃ¼gen
    $('#simple-button').click(function(e){  
      notifyMe();
    });
  
  //Simple Demo
  function notifyMe() {
    //Prüfen ob Unterstützung vorliegt
    if (!Notification) {
      alert('Leider sind Web Notifications in deinem Browser nicht verfügbar.'); 
      return;
    }
    //Falls noch keine Erlaubnis vorliegt Bescheid geben
    if (Notification.permission !== "granted")
      alert('Es liegt aus irgendeinem Grund keine Berechtigung für Notifications vor.'); 
    else {
      //Wenn alles OK ist die Notification erzeugen
      var notification = new Notification(
          'Alle Infos zur Vorlesung', 
          {
            icon: './notify-icon.png',
            body: "Klich hier!", 
      });
      //Ein Ziel bei Click einfügen
      notification.onclick = function () {
        window.open("https://dhbw.koch.team/");      
      };
      
    }
  
  }
  