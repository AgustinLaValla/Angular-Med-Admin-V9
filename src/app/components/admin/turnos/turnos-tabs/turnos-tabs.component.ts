import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState, getEspecialistId, openTable, getTableType } from 'src/app/store/app.reducer';
import { Subscription } from 'rxjs';
import { loadOpenTable, loadCloseTable, HideTurnosData, loadResetTurnoList, hideCalendar, showCalendar } from 'src/app/store/actions';
import { MatDialog } from '@angular/material/dialog';
import { TurnosDialogComponent } from '../turnos-dialog/turnos-dialog.component';

@Component({
  selector: 'app-turnos-tabs',
  templateUrl: './turnos-tabs.component.html',
  styleUrls: ['./turnos-tabs.component.css']
})
export class TurnosTabsComponent implements OnInit, OnDestroy {


  private especialistIdSubs$ = new Subscription();
  public especialistId:string;

  private openTableSubs$ = new Subscription();
  public isOpen:boolean = false;

  private tableTypeSubs$ = new Subscription();
  public tableType: 'Especialistas' | 'Turnos Pasados';

  public tabIndex:number = 1;

  constructor(private store:Store<AppState>, private dialog:MatDialog) { }

  ngOnInit(): void {
    this.getEspecialistaId();
    this.tableSubs();
    this.showTableOrCalendar();
  };

  getEspecialistaId() { 

    this.especialistIdSubs$ = this.store.select(getEspecialistId).subscribe(especialistId => {
      if(especialistId) {
        this.especialistId = especialistId;
      };
    });
  };

  tableSubs() { 
    this.openTableSubs$ = this.store.select(openTable).subscribe((isOpen) => this.isOpen = isOpen);
    this.tableTypeSubs$ = this.store.select(getTableType).subscribe(tableType => this.tableType = tableType);
  };

  showTableOrCalendar() {  
    if(this.tabIndex === 0) { 
      this.store.dispatch( hideCalendar() );
      this.store.dispatch( loadResetTurnoList() );
      this.store.dispatch( loadOpenTable({especialistaId:this.especialistId, tableType:'Especialistas',counter:15}) );
    } else { 
      this.store.dispatch( loadResetTurnoList() );
      this.store.dispatch(loadCloseTable());
      this.store.dispatch(showCalendar());
    }
  };

  openDialog(action: string, turno = null) {
    this.dialog.open(TurnosDialogComponent, {
      data: { action: action, especialistaId: this.especialistId, turno: turno }
    })
  }

  closeTabs() {
    this.store.dispatch(HideTurnosData());
    this.store.dispatch(loadCloseTable());
  }

  ngOnDestroy(): void {
    this.especialistIdSubs$.unsubscribe();
    this.openTableSubs$.unsubscribe();
    this.tableTypeSubs$.unsubscribe();
  }

}
