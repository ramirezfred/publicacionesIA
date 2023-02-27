import { Component, OnInit, AfterViewInit, ElementRef, ViewChild, Renderer2, OnDestroy  } from '@angular/core';

//Mis imports
import { HttpClient } from '@angular/common/http';
import { APIService } from '../../services/API/API.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { SesionService } from '../../services/sesion/sesion.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy {

  email= ''
	password='';
	private data:any;
	public loading = false;
	submitted = false;

  recordarme = false;

  //Gradiente
  @ViewChild('gradiente') grad: ElementRef;
  color_a = "#dedede";
  color_b = "#4c7c94";

  constructor(private http: HttpClient,
              private api_serv: APIService,
              private router: Router,
              private sesion_serv: SesionService,
              private renderer2: Renderer2,
    )
  {
    this.color_a = this.sesion_serv.getColorA();
    this.color_b = this.sesion_serv.getColorB();
  }

  ngOnInit() {
    if ( localStorage.getItem('email') ) {
      this.email = localStorage.getItem('email');
      this.recordarme = true;
    }
  }
  ngOnDestroy() {
  }

  ngAfterViewInit() {
    this.setGradiente(this.color_a, this.color_b);
  }

  setGradiente(Color_a : string = this.color_a, Color_b : string = this.color_b) : void {
    //style="background: linear-gradient(87deg, {{color_a}} 0, {{color_b}} 100%) !important;"
    const Gradiente = this.grad.nativeElement;
    //console.log(Gradiente);
    this.renderer2.setStyle(Gradiente, 'background', `linear-gradient(87deg, ${ Color_a } 0, ${ Color_b } 100%)`);
    //bg-gradient-danger
  }

  Ingresar(){

    this.loading = true;
    this.submitted = true;
   
    var datos= {
      email: this.email,
      password: this.password
    };
    
    /* this.api_serv.postQuery('auth/login/web', datos)
    .subscribe( (data : any ) => {
      console.log(data);
      this.router.navigateByUrl('/dashboard');
    }, (error : any ) => {
      console.log(error);
      //console.log(error.error.error);
      alert(error.error.error);
    }); */

    Swal.fire({
      title: 'Espere',
      text: 'Ingresando',
      icon: 'info',
      allowOutsideClick: false
    });
    Swal.showLoading();

    var that = this;

    this.api_serv.postQuery('auth/login/web', datos)
    .subscribe({
      next(data : any) {
        console.log(data);
        that.api_serv.setToken(data.access_token, data.expires_in);
        /* Swal.close ();
        that.router.navigateByUrl('/dashboard'); */

        if ( that.recordarme ) {
          localStorage.setItem('email', that.email);
        }

        that.getUser();
      },
      error(msg) {
        console.log(msg);
        //console.log(msg.error.error);
        //alert(msg.error.error);

        Swal.fire({
          title: 'Error',
          text: msg.error.error,
          icon: 'error'
        });

      }
    });

  }

  getUser(){
  
    var datos = {};

    var that = this;

    this.api_serv.getQuery('auth/user')
    .subscribe({
      next(data : any) {
        console.log(data);
       

        if (data.user.id) {
          that.sesion_serv.setUser(data.user);
          //admin
          Swal.close ();
          that.router.navigateByUrl('/dashboard');
          
        }else{
          Swal.fire({
            title: 'Error',
            text: 'Error al autenticar usuario',
            icon: 'error'
          });
        }
        
      },
      error(msg) {
        console.log(msg);

        Swal.fire({
          title: 'Error',
          text: msg.error.error,
          icon: 'error'
        });

      }
    });

  }

  

}
