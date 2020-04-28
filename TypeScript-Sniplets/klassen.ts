class SayHello {
    msg: string = "leer";
    private ansprache: string = "Hallo ";

    public setAnsprache(ansprache:string) : void {

    } 
    constructor(message: string) {
        this.msg = message;
    }
    Output() {
        return this.ansprache + this.msg;
    }
  }
  let ToDo = new SayHello('DHBW');
  ToDo.ansprache = "Na Du ";
  console.log(ToDo.Output()); 		//Hallo DHBW
  