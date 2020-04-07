// A Base class
class Language {
}
class English extends Language {
  greeting() {
    console.log("Hello");
  }
}
 
class French  extends Language {
  greeting() {
    console.log("Bonjour");
  }
}
 
function intro(language) {
  // Check type of 'language' object.
  if(language instanceof Language)  {
    language.greeting();
  }
}
 
// -------------- TEST ----------------------
 
let pete = new English();
let francoise = new French();
 
// Call function:
intro(pete);
intro(francoise);
 
let someObject = {};
intro(someObject);
