// Button mit alert
//
document.querySelector('button').addEventListener('click', () => {
    alert('Hi, hier bin ich!')
});
/*****************************************************************************
//
// Service Worker initialisieren
//
 *****************************************************************************/

 if ('serviceWorker' in navigator) {
navigator.serviceWorker.register('./sw.js')
    .then(reg => console.log('Registrierung erfolgreich. Scope ist ' + reg))
    .catch(err => console.log('Registrierung fehlgeschlagen mit ' + err));
}
