import { Component, OnInit, ElementRef, Output, EventEmitter } from '@angular/core';
import { ROUTES } from '../sidebar/sidebar.component';
import { Location, LocationStrategy, PathLocationStrategy } from '@angular/common';
import { Router } from '@angular/router';

import { SesionService } from '../../services/sesion/sesion.service';
import { SearchService } from '../../services/search/search.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
  public focus;
  public listTitles: any[];
  public location: Location;

  public user_imagen: string = '';
  public user_nombre: string = '';

  inputTermino : string = '';

  public user_tipo: number = null;
  
  constructor(location: Location,
      private element: ElementRef,
      private router: Router,
      private sesion_serv: SesionService,
      private search_serv: SearchService,
      ) {

    this.location = location;
  }

  ngOnInit() {
    
    this.user_tipo = this.sesion_serv.getUserTipo();

    if (this.user_tipo == 1) {
      this.listTitles = ROUTES.filter(listTitle => listTitle);
    }

    this.user_imagen = this.sesion_serv.getUserImagen();
    this.user_nombre = this.sesion_serv.getUserNombre();
  }

  eventBuscar(){
    this.search_serv.buscar$.emit(this.inputTermino); 
  }

  getTitle(){
    var titlee = this.location.prepareExternalUrl(this.location.path());
    if(titlee.charAt(0) === '#'){
        titlee = titlee.slice( 1 );
    }

    for(var item = 0; item < this.listTitles.length; item++){
        if(this.listTitles[item].path === titlee){
            return this.listTitles[item].title;
        }
    }
    return 'Dashboard';
  }

  logout() {
    this.sesion_serv.resetSesion();
    this.router.navigateByUrl('/login');
  }

}
