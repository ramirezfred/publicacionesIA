import { Injectable } from '@angular/core';

//Mis imports
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class APIService {

  //Local freddy
	// public api_base = 'http://localhost/sistema_contable_kien/sistemaKienAPI/public/api/';
	// public images_base = 'http://localhost/sistema_contable_kien/sistemaKienAPI/public/images_uploads/';
	// public api_public = 'http://localhost/sistema_contable_kien/sistemaKienAPI/public/';

	//Remoto vps
	public api_base = `https://kien.internow.com.mx/api/`;
	public images_base = `https://kien.internow.com.mx/images_uploads/`;
	public api_public = `https://kien.internow.com.mx/`;

  constructor(private http: HttpClient) { }

	getRutaApi(){
		return this.api_base;
	}

	getRutaImages(){
		return this.images_base;
	}

	getToken(){
		if (sessionStorage.getItem('token')) {
			return sessionStorage.getItem("token");
		}else{
			return '';
		}
	}

	setToken( token : string, expires_in : number ){
		sessionStorage.setItem('token', token);   // localStorage.setItem('id', noOfClicks);
		
		/* let hoy = new Date();
    	hoy.setSeconds( 3600 );

    	localStorage.setItem('expira', hoy.getTime().toString() ); */

		let hoy = new Date();
    	hoy.setSeconds( expires_in );

		sessionStorage.setItem('expires_in', hoy.getTime().toString());   // localStorage.setItem('id', noOfClicks);
	}

	resetToken( ){
		sessionStorage.removeItem('token');    // localStorage.removeItem('id');
		sessionStorage.removeItem('expires_in');    // localStorage.removeItem('id');
	}

	postQuery( query : string, datos ){
		
		const url = this.api_base + query;

		const httpOptions = {
			headers: new HttpHeaders({
				'Authorization' : 'Bearer '+this.getToken(),
				'Content-Type': 'application/json',
				'Access-Control-Allow-Origin': '*',
				'Access-Control-Allow-Headers': '*',
				'Accept': 'application/json, text/plain'
			})
		  };

		//console.log('token serv '+this.getToken());  

		return this.http.post(url, datos, httpOptions);
	}

	postQueryUpload( query : string, datos ){
		
		const url = this.api_base + query;

		const httpOptions = {
			headers: new HttpHeaders({
				'Authorization' : 'Bearer '+this.getToken(),
				//'Content-Type': 'application/json',
				'Access-Control-Allow-Origin': '*',
				'Access-Control-Allow-Headers': '*',
				'Accept': 'application/json, text/plain',
				'enctype': 'multipart/form-data'
			})
		  };

		//console.log('token serv '+this.getToken());  

		return this.http.post(url, datos, httpOptions);
	}

	postQueryUploadV2( query : string, datos ){
		
		const url = this.api_public + query;

		const httpOptions = {
			headers: new HttpHeaders({
				'Authorization' : 'Bearer '+this.getToken(),
				//'Content-Type': 'application/json',
				'Access-Control-Allow-Origin': '*',
				'Access-Control-Allow-Headers': '*',
				'Accept': 'application/json, text/plain',
				'enctype': 'multipart/form-data'
			})
		  };

		//console.log('token serv '+this.getToken());  

		return this.http.post(url, datos, httpOptions);
	}

	getQuery( query : string ){
		
		const url = this.api_base + query;

		const httpOptions = {
			headers: new HttpHeaders({
				'Authorization' : 'Bearer '+this.getToken(),
			})
		  };
		
		//console.log('token serv '+this.getToken()); 

		return this.http.get(url, httpOptions);
	}

	deleteQuery( query : string ){
		
		const url = this.api_base + query;

		const httpOptions = {
			headers: new HttpHeaders({
				'Authorization' : 'Bearer '+this.getToken(),
			})
		  };
		
		//console.log('token serv '+this.getToken()); 

		return this.http.delete(url, httpOptions);
	}

	putQuery( query : string, datos ){
		
		const url = this.api_base + query;

		const httpOptions = {
			headers: new HttpHeaders({
				'Authorization' : 'Bearer '+this.getToken(),
				'Content-Type': 'application/json',
				'Access-Control-Allow-Origin': '*',
				'Access-Control-Allow-Headers': '*',
				'Accept': 'application/json, text/plain'
			})
		  };

		//console.log('token serv '+this.getToken());  

		return this.http.put(url, datos, httpOptions);
	}
}
