import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AppState, getEspecialidades, getMiembro } from 'src/app/store/app.reducer';
import { Store } from '@ngrx/store';
import { Miembro } from 'src/app/interfaces/miembro.interface';
import { Especialidad } from 'src/app/interfaces/especialidad.interface';
import { loadAddMiembro, loadGetEspecialidades, deactivateLoading, loadGetMiembro, loadResetMiembro, loadUpdateMiembro } from 'src/app/store/actions';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-dialog-member',
  templateUrl: './dialog-member.component.html',
  styleUrls: ['./dialog-member.component.css']
})
export class DialogMemberComponent implements OnInit, OnDestroy {

  public new_miembro:Miembro = {
    apellido:'',
    nombre:'',
    especialidad:'',
    mutuales_adheridas: [],
    genero:'',
  }
  private miembroSubs$ = new Subscription();

  public image:File;
  public loadingImage:boolean = false;
  public imageLoaded:boolean = false;


  private especialidadesSubs = new Subscription();
  public especialidades: Especialidad[] = [];

  public obras_sociales: string[] = [
    'Particular',
    'OSDE',
    'Medicus',
    'Swiss Medical',
    'Galeno',
    'Medité',
    'Luis Pasteur',
    'OS Petroleros',
    'Unión Personal',
    'OS Sanidad',
    'Ostecac',
    'OS Rural',
    'OS Bancaria',
    'Osdepym',
    'Accord',
    'Ominit',
    'Federación Salud',
    'Apress Salud',
    'Bristol Medicine',
    'AcaSalud',
    'Prevención Salud',
    'Plan de salud del hospital italiano',
    'FEMEBA',
    'OS Camioneros',
    'DASUTeN',
    'Andar Obra Social',
    'OSPACA',
    'Jerárquicos Salud'
  ]

  constructor(
    public dialogRef:MatDialogRef<DialogMemberComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {action:string, id?:string},
    private store:Store<AppState>) {

    this.especialidadesSubs = this.store.select(getEspecialidades).subscribe((especialidades:Especialidad[]) => {
      this.store.dispatch(  deactivateLoading() );
      this.especialidades = especialidades
    })
    this.miembroSubs$ = this.store.select(getMiembro).subscribe((miembro:Miembro) => {
      if(miembro) {
        this.new_miembro = miembro
      }
    })

    this.store.dispatch( loadGetEspecialidades() )
    if(data.id) { 
      this.store.dispatch( loadGetMiembro({id: data.id}) )
    }
   }

  ngOnInit() { }

  addMiembro() { 
    this.store.dispatch( loadAddMiembro({miembro:this.new_miembro, image: this.image}) );
    this.image = null;
    this.dialogRef.close();
  }

  updateMiembro() { 
    this.store.dispatch(loadUpdateMiembro({miembro:this.new_miembro, image:this.image}));
    this.dialogRef.close();
  }

  loadImage(image) { 
    this.loadingImage = true;
    this.imageLoaded = false;
    if(image) {
      this.image = image.target.files[0];
      this.loadingImage = false;
      this.imageLoaded = true;
    }
  }

  ngOnDestroy(): void {
    this.store.dispatch( loadResetMiembro() )
    this.especialidadesSubs.unsubscribe();
    this.miembroSubs$.unsubscribe();
  }

}
