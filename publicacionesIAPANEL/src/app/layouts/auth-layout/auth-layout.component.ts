import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';

import { LogoService } from '../../services/logo/logo.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-auth-layout',
  templateUrl: './auth-layout.component.html',
  styleUrls: ['./auth-layout.component.scss']
})
export class AuthLayoutComponent implements OnInit, OnDestroy {
  test: Date = new Date();
  public isCollapsed = true;

  //logo = 'assets/img/brand/LogoInterNowPNG.png';
  logo = 'assets/img/brand/logo_kien.png';
  logoSubscription : Subscription;

  constructor(private router: Router,
              private logo_serv: LogoService,
              )
  {



  }

  ngOnInit() {
    var html = document.getElementsByTagName("html")[0];
    html.classList.add("auth-layout");
    var body = document.getElementsByTagName("body")[0];
    body.classList.add("bg-default");
    this.router.events.subscribe((event) => {
      this.isCollapsed = true;
   });

    this.logoSubscription = this.logo_serv.logo_negocio$.subscribe( logo => {
      if(logo != null && logo != ''){
        this.logo = logo;
      }else{
        this.logo = 'assets/img/brand/LogoInterNowPNG.png';
      }
      
    });

  }
  ngOnDestroy() {
    var html = document.getElementsByTagName("html")[0];
    html.classList.remove("auth-layout");
    var body = document.getElementsByTagName("body")[0];
    body.classList.remove("bg-default");
  }
}
