import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { EspecialidadesRoutingModule } from './especialidades-routing.module';
import { EspecialidadesComponent } from './especialidades.component';
import { MaterialModule } from 'src/app/material/material.module';
import { DialogServicesComponent } from './dialog-services/dialog-services.component';
import { FormsModule } from '@angular/forms';



@NgModule({
  declarations: [EspecialidadesComponent, DialogServicesComponent],
  imports: [
    CommonModule,
    EspecialidadesRoutingModule,
    MaterialModule,
    FormsModule,
  ],
  exports: [MaterialModule, FormsModule]

})
export class EspecialidadesModule { }
