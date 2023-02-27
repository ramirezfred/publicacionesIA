import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { SesionService } from '../../services/sesion/sesion.service';
import { SearchService } from '../../services/search/search.service';

declare interface RouteInfo {
    path: string;
    title: string;
    icon: string;
    class: string;
}

//Admin
export const ROUTES: RouteInfo[] = [
    { path: '/dashboard', title: 'Dashboard',  icon: 'ni-tv-2 text-primary', class: '' },
    /*{ path: '/icons', title: 'Icons',  icon:'ni-planet text-blue', class: '' },
    { path: '/maps', title: 'Maps',  icon:'ni-pin-3 text-orange', class: '' },
    { path: '/user-profile', title: 'User profile',  icon:'ni-single-02 text-yellow', class: '' },
    { path: '/tables', title: 'Tables',  icon:'ni-bullet-list-67 text-red', class: '' },*/ 
    //{ path: '/login', title: 'Login',  icon:'ni-key-25 text-info', class: '' },
    //{ path: '/register', title: 'Register',  icon:'ni-circle-08 text-pink', class: '' },

    { path: '/cuentas', title: 'Cuentas',  icon:'ni-ungroup text-blue', class: '' },
    { path: '/obras', title: 'Obras',  icon:'ni-ungroup text-blue', class: '' },
    { path: '/partidas', title: 'Partidas',  icon:'ni-ungroup text-blue', class: '' },
    { path: '/movimientos', title: 'Movimientos',  icon:'ni-ungroup text-blue', class: '' },
    { path: '/sistema', title: 'Sistema',  icon:'ni ni-settings-gear-65 text-blue', class: '' },

];

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {

  public menuItems: any[];
  public isCollapsed = true;

  public user_imagen: string = '';
  public user_nombre: string = '';
  public user_tipo: number = null;

  inputTermino : string = '';

  constructor(private router: Router,
    private sesion_serv: SesionService,
    private search_serv: SearchService,
    ) { }

  ngOnInit() {

    this.user_tipo = this.sesion_serv.getUserTipo();

    if (this.user_tipo == 1) {
      this.menuItems = ROUTES.filter(menuItem => menuItem);
    }
    
    this.router.events.subscribe((event) => {
      this.isCollapsed = true;
    });

    this.user_imagen = this.sesion_serv.getUserImagen();
    this.user_nombre = this.sesion_serv.getUserNombre();

  }

  eventBuscar(){
    this.search_serv.buscar$.emit(this.inputTermino); 
  }

  logout() {
    this.sesion_serv.resetSesion();
    this.router.navigateByUrl('/login');
  }
  
}
