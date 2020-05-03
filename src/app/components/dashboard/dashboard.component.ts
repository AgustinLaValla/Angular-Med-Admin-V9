import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  public opened:boolean = false;

  constructor(private authService:AuthService, 
              private matIconRegistry:MatIconRegistry,
              private domSanatizer: DomSanitizer) {

      this.matIconRegistry.addSvgIcon(
                          'logout', 
                           domSanatizer.bypassSecurityTrustResourceUrl('../../assets/icons/logout.svg')
                 )
               }

  ngOnInit() {
  }

  logOut() { 
    this.authService.logout();
  }

}

