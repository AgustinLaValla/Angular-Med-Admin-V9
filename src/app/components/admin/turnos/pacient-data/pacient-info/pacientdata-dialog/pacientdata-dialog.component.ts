import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Pacient } from 'src/app/interfaces/pacient.interface';
import { Store } from '@ngrx/store';
import { AppState } from 'src/app/store/app.reducer';
import { loadUpdateSinglePacientInfo, hidePacientData, loadResetPacientStoreData } from 'src/app/store/actions';
import * as moment from 'moment';

@Component({
  selector: 'app-pacientdata-dialog',
  templateUrl: './pacientdata-dialog.component.html',
  styleUrls: ['./pacientdata-dialog.component.css']
})
export class PacientdataDialogComponent implements OnInit {

  public pacient: Pacient;
  public pacientBackUp: Pacient;
  public nacimiento: moment.Moment;

  public maxDate = moment();

  constructor(public dialogRef: MatDialogRef<PacientdataDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { pacientInfo: Pacient },
    private store: Store<AppState>) { }

  ngOnInit() {
    const { pacientInfo } = this.data;
    this.pacientBackUp = { ...pacientInfo };
    this.pacient = pacientInfo;
    this.nacimiento = moment(pacientInfo.nacimiento).utc().clone();
  }

  chosenYearHandler(year: moment.Moment) {
    this.nacimiento = moment().year(year.year());

  }

  chosenMonthHandler(month: moment.Moment) {
    console.log(month);
    this.nacimiento = moment(this.pacient.nacimiento).month(month.month())
  }


  saveChanges() {
    console.log(JSON.stringify(this.pacient) != JSON.stringify(this.pacientBackUp))
    if (JSON.stringify(this.pacient) != JSON.stringify(this.pacientBackUp)) {

      this.store.dispatch(loadUpdateSinglePacientInfo({
        oldPacientData: this.pacientBackUp,
        newPacientData: this.pacient
      }));
      this.store.dispatch( loadResetPacientStoreData() );
      this.store.dispatch(hidePacientData());
      
    }
    this.dialogRef.close();
  }

  checkFechaDeNacimiento(){ 
    const { pacientInfo } = this.data;
    console.log(moment(this.nacimiento).utc().unix() == pacientInfo.nacimiento_seconds)
    if(moment(this.nacimiento).utc().unix() != pacientInfo.nacimiento_seconds) {
      this.pacient.nacimiento = this.nacimiento.toString();
      this.pacient.nacimiento_seconds = moment(this.nacimiento).clone().unix();
    }
  }

}
