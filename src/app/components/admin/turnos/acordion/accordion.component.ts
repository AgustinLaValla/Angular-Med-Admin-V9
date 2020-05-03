import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState, getPacientes } from 'src/app/store/app.reducer';
import { Subscription } from 'rxjs';
import { Pacient } from 'src/app/interfaces/pacient.interface';
import { loadGetPacients, loadGetPacientsCounter } from 'src/app/store/actions';

@Component({
  selector: 'app-accordion',
  templateUrl: './accordion.component.html',
  styleUrls: ['./accordion.component.css']
})
export class AccordionComponent implements OnInit, OnDestroy {

  private pacientesSubs$ = new Subscription();
  public pacientList: Pacient[];
  public count:number;

  constructor(private store:Store<AppState>) { 
    this.pacientesSubs$ = this.store.select(getPacientes).subscribe((pacientes:Pacient[]) => {
        this.pacientList = pacientes;
    })

    this.count = 5;

    this.store.dispatch(loadGetPacients({count:this.count}));
    this.store.dispatch(loadGetPacientsCounter());
  }

  ngOnInit() {
  }

  ngOnDestroy(): void {
    this.pacientesSubs$.unsubscribe();
  }


}
