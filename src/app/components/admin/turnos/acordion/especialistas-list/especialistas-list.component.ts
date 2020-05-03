import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState, getStuff, getIsLoading, getTableType } from 'src/app/store/app.reducer';
import { Subscription } from 'rxjs';
import { loadGetStuff, deactivateLoading, loadOpenTable, loadGetEspecialidadByItsName, loadCloseTable, unsubscribeLoading } from 'src/app/store/actions';
import { Miembro } from 'src/app/interfaces/miembro.interface';

@Component({
  selector: 'app-especialistas-list',
  templateUrl: './especialistas-list.component.html',
  styleUrls: ['./especialistas-list.component.css']
})
export class EspecialistasListComponent implements OnInit, OnDestroy {

  private loadingSubs$ = new Subscription();
  public loading: boolean = false;

  private stuffSubs$ = new Subscription();
  public stuff: Miembro[];

  private tableTypeSubs$ = new Subscription();
  private tableType: 'Especialistas' | 'Turnos Pasados';

  @Input() headerDescription: string;

  constructor(private store:Store<AppState>) {
    //SUBSCRIPTIONS
    this.stuffSubs$ = this.store.select(getStuff).subscribe((stuff:Miembro[]) => {
      this.store.dispatch( deactivateLoading() )
      this.stuff = (stuff) ? stuff : null;
    });

    this.tableTypeSubs$ = this.store.select(getTableType).subscribe((tableType) => { 
      if(tableType) { 
        this.tableType = tableType;
      };
    });

    this.getLoadingSubs();

    this.store.select(unsubscribeLoading).subscribe(unsubscribe => {
      if(unsubscribe) {
        this.loadingSubs$.unsubscribe()
      } else {
        this.getLoadingSubs();
      }
    })


    //DISPATCHS
    this.store.dispatch( loadGetStuff() );
   }

  ngOnInit() {
  }

  showTurnos(especialista:Miembro) { 
    this.loadingSubs$.unsubscribe();
    
    if(this.headerDescription == 'Especialistas') { 

      if(this.tableType == 'Turnos Pasados') { 
        this.store.dispatch( loadCloseTable() );
      }

      this.store.dispatch( loadOpenTable({especialistaId:especialista.id, tableType:'Especialistas',counter:15}) );

    }else if(this.headerDescription == 'Turnos Pasados') { 

      if(this.tableType == 'Especialistas') { 
        this.store.dispatch( loadCloseTable() );
      }

      this.store.dispatch( loadOpenTable({especialistaId:especialista.id, tableType:'Turnos Pasados',counter:15}) );
    };

    this.store.dispatch( loadGetEspecialidadByItsName({nombreEspeciliadad: especialista.especialidad}) );
  }

  getLoadingSubs() { 
    this.loadingSubs$ = this.store.select( getIsLoading ).subscribe((loading:boolean) => this.loading = loading);
  }

  ngOnDestroy(): void {
    this.stuffSubs$.unsubscribe();
    this.tableTypeSubs$.unsubscribe()
    // this.loadingSubs$.unsubscribe();
  }

}
