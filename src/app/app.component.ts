import { Component, Inject } from '@angular/core';
import { AppState } from './store/app.reducer';
import { Store } from '@ngrx/store';
import { AuthService } from './services/auth.service';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  constructor(@Inject(AuthService) private authService: AuthService) { 
    this.authService.initAuthListener();
   }
  title = 'consultorio-ayacucho-app';
}
