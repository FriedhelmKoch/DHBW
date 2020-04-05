import { Component } from '@angular/core';
import { Student } from '../app.classes';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})

export class Tab2Page {

  constructor() {

    // Variablen Beipiele in Angular
    //
    this.hallo = 'Hallo Welt';

    // Anonyme Funktion mit Callback - Lambda - nach 5 Sek. Änderung
    setTimeout(() => {
      this.hallo = 'Hallo DHBW';
    }, 5000);

  }

  title = 'Das ist Tab-2';
  hallo: string;
  inputValue = '';
  counterRunning = false;
  counterInterval: any;
  currentTime = 0;

  students = [
    new Student('Peter', 'Mueller'),
    new Student('Max', 'Huebner'),
    new Student('Andrea', 'Koch')
  ];

  onAddStudent(){
    this.students.push(
      new Student('Johanna','Weber')
    );
  }

  onDeleteStudent(index: number) {
    this.students.splice(index, 1);
  }

  onInputChange(inputValue: string) {
    this.inputValue = inputValue;
  }

  onStartCounter() {
    this.counterRunning = true;
    this.counterInterval = setInterval(() => {
      this.currentTime = this.currentTime + 1;
    }, 1000);
  }

  onStopCounter() {
    this.counterRunning = false;
    clearInterval(this.counterInterval);
  }

}
