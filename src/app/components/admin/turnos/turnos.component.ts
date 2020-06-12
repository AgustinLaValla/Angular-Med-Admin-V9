import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { Store } from '@ngrx/store';
import { AppState, openTable, getPacientData, getShowTurnosData, getTableType } from 'src/app/store/app.reducer';
import {  hidePacientData, loadResetEspecialidad, HideTurnosData } from 'src/app/store/actions';

@Component({
  selector: 'app-turnos',
  templateUrl: './turnos.component.html',
  styleUrls: ['./turnos.component.css']
})
export class TurnosComponent implements OnInit, OnDestroy {

  private showPacientDataSubs$ = new Subscription();
  public showPacientData: boolean;

  private showTurnosDataSubs$ = new Subscription();
  public showTurnosData: boolean = false;

  private openTableSubs$ = new Subscription();
  public isOpen:boolean = false;

  private tableTypeSubs$ = new Subscription();
  public tableType:'Especialistas' | 'Turnos Pasados';

  constructor(private store: Store<AppState>) {

    this.showTurnosDataSelectorsSubscription();
    this.showPacientDataSubscription();
    this.getTableData();
    
  };

  ngOnInit() {  }


  showTurnosDataSelectorsSubscription() {
    this.showTurnosDataSubs$ = this.store.select(getShowTurnosData).subscribe(show => {
      this.showTurnosData = show;
      if (show) {
        this.store.dispatch(hidePacientData());
      };
    });
  };

  showPacientDataSubscription() {

    this.showPacientDataSubs$ = this.store.select(getPacientData).subscribe((show) => {
      this.showPacientData = show;
      if (show) {
        this.store.dispatch(HideTurnosData());
      }
    });
  };

  getTableData() { 
    this.openTableSubs$ = this.store.select(openTable).subscribe(isOpen => this.isOpen = isOpen);
    this.tableTypeSubs$ = this.store.select(getTableType).subscribe(tableType => {
      this.tableType = tableType;
      if(tableType === 'Turnos Pasados') { 
        this.store.dispatch( hidePacientData() );
      };
    });
  }

  ngOnDestroy(): void {
    this.showTurnosDataSubs$.unsubscribe();
    this.showPacientDataSubs$.unsubscribe();
    this.openTableSubs$.unsubscribe();
    this.tableTypeSubs$.unsubscribe();
    this.store.dispatch(loadResetEspecialidad());
  };
};