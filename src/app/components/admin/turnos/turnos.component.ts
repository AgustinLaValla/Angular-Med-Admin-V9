import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { Store } from '@ngrx/store';
import { AppState, openTable, getPacientData } from 'src/app/store/app.reducer';
import { loadCloseTable, hidePacientData, loadResetEspecialidad } from 'src/app/store/actions';

@Component({
  selector: 'app-turnos',
  templateUrl: './turnos.component.html',
  styleUrls: ['./turnos.component.css']
})
export class TurnosComponent implements OnInit, OnDestroy {

  private openTableSubs$ = new Subscription();
  public openTable: boolean = false;

  private showPacientDataSubs$ = new Subscription();
  public showPacientData:boolean;
  

  constructor(private store: Store<AppState>) {

    //SUBSCRIPTIONS
    this.openTableSubs$ = this.store.select(openTable).subscribe((open: boolean) => {
      this.openTable = open;
      if(open) { 
        this.store.dispatch( hidePacientData() );

      }
    });

    this.showPacientDataSubs$ = this.store.select(getPacientData).subscribe((show) => {
      this.showPacientData = show;
      if(show){
        this.store.dispatch( loadCloseTable() );

      }
    });

  }

  ngOnInit() {
  }

  ngOnDestroy(): void {
    this.openTableSubs$.unsubscribe();
    this.showPacientDataSubs$.unsubscribe();
    this.store.dispatch( loadResetEspecialidad() );
  }
}
