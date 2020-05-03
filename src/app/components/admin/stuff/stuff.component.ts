import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState, getStuff, getIsLoading } from 'src/app/store/app.reducer';
import { Miembro } from 'src/app/interfaces/miembro.interface';
import { deactivateLoading, loadGetStuff, loadDeleteMiembro } from 'src/app/store/actions';
import { MatDialog } from '@angular/material';
import { DialogMemberComponent } from './dialog-member/dialog-member.component';
import { Subscription } from 'rxjs';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-stuff',
  templateUrl: './stuff.component.html',
  styleUrls: ['./stuff.component.css']
})
export class StuffComponent implements OnInit, OnDestroy {

  public loading:boolean = false;
  private loadingSubs = new Subscription();

  public stuff:Miembro[];
  private stuffSubs = new Subscription();

  constructor(private store:Store<AppState>, private dialog:MatDialog) {
    this.loadingSubs = this.store.select(getIsLoading).subscribe((loading:boolean) => this.loading = loading)
    this.stuffSubs = this.store.select(getStuff).subscribe((stuff:Miembro[]) =>{
      this.store.dispatch( deactivateLoading() ) 
      this.stuff = stuff;
    })
    this.store.dispatch( loadGetStuff() )
   }

  ngOnInit() { }

  openDialog(action:string, id?:string) {  
    this.loadingSubs.unsubscribe();
    const dialogRef = this.dialog.open(DialogMemberComponent,{
      data: {action:action, id:id}
    });
    dialogRef.afterClosed().subscribe(() =>  this.loadingSubs = this.store.select(getIsLoading)
                                                                          .subscribe((loading:boolean) => 
                                                                                      this.loading = loading))
  }

  deleteMiembro(id:string) { 
    Swal.fire({
      title: '¿Seguro quieres borrar al miembro del Stuff?',
      text: "¡Al borrar a un miembro del stuff automáticamente se borran sus turnos! ",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e91e63',
      cancelButtonColor: '#6a0080',
      confirmButtonText: '¡SÍ, QUIERO BORRARLO!',
      cancelButtonText: 'CANCELAR'
    }).then((result) => {
      if (result.value) {
        this.store.dispatch( loadDeleteMiembro({id: id}) );
        Swal.fire(
          'Miembro Eliminado ;)',
          'El miembro ha sido eliminado del Stuff (¡sus turnos también!)',
          'success'
        )
      }
    })
  }
  
  ngOnDestroy(): void {
   this.stuffSubs.unsubscribe();
   this.loadingSubs.unsubscribe();
  }

}
