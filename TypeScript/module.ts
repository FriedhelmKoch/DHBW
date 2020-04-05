export interface iLebewesen {
    beine: number;
    move(): void;
}

export class Tier implements iLebewesen {
    name: string;
    beine: number = 4;
    constructor(theName: string) { 
    this.name = theName; 
    }
    move(km: number = 0) {
    console.log(this.name + ' hat ' + this.beine + ' Beine und bewegte sich mit ' + km + ' km/h.');
    }
}
