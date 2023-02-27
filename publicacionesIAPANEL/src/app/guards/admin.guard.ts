import { Injectable } from '@angular/core';
//import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot, UrlTree } from '@angular/router';
import { CanActivate, Router } from '@angular/router';
import { Observable } from 'rxjs';

import { SesionService } from '../services/sesion/sesion.service';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {

  constructor( private router: Router,
    private sesion_serv: SesionService) {}

  /* canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return true;
  } */

  canActivate(): boolean  {

    if ( this.sesion_serv.getUserTipo() ) {
      if (this.sesion_serv.getUserTipo() == 1) {
        return true;
      }else{
        Swal.fire({
          title: 'Warning',
          text: 'Acceso denegado, no tienes permisos para acceder a esta página.',
          icon: 'warning'
        });
        this.router.navigateByUrl('/login');
        return false;
      }
    } else {
      Swal.fire({
        title: 'Warning',
        text: 'Acceso denegado, es necesario iniciar sesión para acceder a esta página.',
        icon: 'warning'
      });
      this.router.navigateByUrl('/login');
      return false;
    }
 
  }
  
}
