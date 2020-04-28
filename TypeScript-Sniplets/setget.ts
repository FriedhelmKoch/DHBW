class SayHello {
    msg: string = "leer";
    private ansprache: string = "Hallo ";

    public setAnsprache(ansprache:string) : void {
        if(ansprache == null) {
            console.log("Nichts geht nicht!");
        } else {
            this.ansprache = ansprache;
        }
    } 
    public getAnsprache(): string {
        return this.ansprache;
    }
    constructor(message: string) {
        this.msg = message;
    }
    Output() {
        return this.ansprache + this.msg;
    }
  }
  let ToDo = new SayHello('DHBW');
  console.log(ToDo.getAnsprache()); //Hallo
  ToDo.setAnsprache("Na Du ");
  console.log(ToDo.Output()); 		//Na Du DHBW
