import { NgModule } from '@angular/core';
import { MatToolbarModule, MatButtonModule, MatSidenavModule, MatIconModule, MatDialogModule, MatInputModule, MatCardModule, 
         MatListModule, MatTooltipModule, MatProgressSpinnerModule, MatSelectModule, MatAccordion, MatExpansionModule, MatTableModule, 
         MatPaginatorModule, MatSortModule, MatDatepickerModule, MatTabsModule, MatTreeModule, MatSnackBarModule} from '@angular/material'

const materialComponents = [
    MatToolbarModule,
    MatButtonModule,
    MatSidenavModule,
    MatIconModule,
    MatDialogModule,
    MatInputModule,
    MatCardModule,
    MatListModule,
    MatTooltipModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatExpansionModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatDatepickerModule,
    MatTabsModule,
    MatTreeModule,
    MatSnackBarModule
];


@NgModule({
    imports: [materialComponents],
    exports: [materialComponents],
})
export class MaterialModule { }
