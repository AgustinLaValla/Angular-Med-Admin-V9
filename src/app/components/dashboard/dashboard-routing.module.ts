import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DashboardComponent } from './dashboard.component';
import { StuffModule } from '../admin/stuff/stuff.module';

const routes: Routes = [{ path: '', component: DashboardComponent, children:[
  { path: '', loadChildren: () => import('../admin/turnos/turnos.module').then(m => m.TurnosModule) },
  {path: 'stuff', loadChildren:() => import('../admin/stuff/stuff-routing.module').then(m => StuffModule)},
  { path: 'especialidades', loadChildren: () => import('../admin/especialidades/especialidades.module').then(m => m.EspecialidadesModule) },
] }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardRoutingModule { }
