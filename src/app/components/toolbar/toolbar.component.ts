import { Component, OnInit, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.css']
})
export class ToolbarComponent implements OnInit {

  public title:string = 'Consultorio Ayacucho App';
  @Output() public opened = new EventEmitter<void>();

  constructor() { }

  ngOnInit() {
  }

  isOpen() {
    this.opened.emit();
  }

}
