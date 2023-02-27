import { Injectable } from '@angular/core';
import { APIService } from '../API/API.service';

@Injectable({
  providedIn: 'root'
})
export class SesionService {

  public user_id : number = null;
  public user_tipo : number = null;
  public user_nombre : string = null;
  public user_imagen : string = null;
  public user_negocio_id : number = null;
  public color_a : string = '#f5365c';
  public color_b : string = '#f56036';
  public user_color_a : string = '#dedede';
  public user_color_b : string = '#4c7c94';
  public user_color_c : string = '#000000';
  public user_empleado_id : number = null;

  constructor(private api_serv: APIService,) { }

  setUser( user : any ){
		sessionStorage.setItem('user', JSON.stringify(user));
	}

  setNegocio( negocio : any ){
    sessionStorage.setItem('negocio', JSON.stringify(negocio));
	}

  getUserId(){
		if (sessionStorage.getItem('user')) {
      let user = JSON.parse(sessionStorage.getItem("user"));
      return user.id;
    }else{
      return null;
    }
	}

  getUserEmail(){
    if (sessionStorage.getItem('user')) {
      let user = JSON.parse(sessionStorage.getItem("user"));
      return user.email;
    }else{
      return null;
    }
  }

  getUserTipo(){
		if (sessionStorage.getItem('user')) {
      let user = JSON.parse(sessionStorage.getItem("user"));
      //return user.tipo_usuario;
      return 1;
    }else{
      return null;
    }
	}

  getUserNombre(){
		if (sessionStorage.getItem('user')) {
      let user = JSON.parse(sessionStorage.getItem("user"));
      //return user.nombre;
      return 'Admin';
    }else{
      return null;
    }
	}

  getUserImagen(){
		if (sessionStorage.getItem('user')) {
      let user = JSON.parse(sessionStorage.getItem("user"));
      //return user.imagen;
      return 'assets/img/brand/logo_kien.png';
    }else{
      return null;
    }
	}

  getColorA(){
    return this.color_a;
  }

  getColorB(){
    return this.color_b;
  }

  getNegocioId(){
		if (sessionStorage.getItem('negocio')) {
      let negocio = JSON.parse(sessionStorage.getItem("negocio"));
      return negocio.id;
    }else{
      return null;
    }
	}

  getNegocioColorA(){
		if (sessionStorage.getItem('negocio')) {
      let negocio = JSON.parse(sessionStorage.getItem("negocio"));
      return negocio.color_a;
    }else{
      return this.user_color_a;
    }
	}

  getNegocioColorB(){
		if (sessionStorage.getItem('negocio')) {
      let negocio = JSON.parse(sessionStorage.getItem("negocio"));
      return negocio.color_b;
    }else{
      return this.user_color_b;
    }
	}

  getNegocioWhatsApp(){
    if (sessionStorage.getItem('negocio')) {
      let negocio = JSON.parse(sessionStorage.getItem("negocio"));
      return negocio.whatsapp;
    }else{
      return null;
    }
  }

  getNegocioSms(){
    if (sessionStorage.getItem('negocio')) {
      let negocio = JSON.parse(sessionStorage.getItem("negocio"));
      return negocio.sms;
    }else{
      return null;
    }
  }

  resetSesion(){
		//sessionStorage.removeItem('id');    // localStorage.removeItem('id');

    sessionStorage.clear();   // localStorage.clear();

    this.api_serv.resetToken();
	}

  estaAutenticado(): boolean {

    if ( this.api_serv.getToken().length < 2 ) {
      return false;
    }

    const expira = Number(sessionStorage.getItem('expires_in'));
    const expiraDate = new Date();
    expiraDate.setTime(expira);

    if ( expiraDate > new Date() ) {
      return true;
    } else {
      return false;
    }


  }

}
