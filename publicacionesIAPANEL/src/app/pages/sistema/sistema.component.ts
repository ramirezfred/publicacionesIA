import { Component, OnInit, AfterViewInit, ElementRef, ViewChild, Renderer2 } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray, NgForm } from '@angular/forms';
import { ValidadoresService } from '../../services/validadores/validadores.service';
import { APIService } from '../../services/API/API.service';
import Swal from 'sweetalert2';
import { DomSanitizer } from '@angular/platform-browser';

import { HttpClient, HttpHeaders } from '@angular/common/http';
import { SesionService } from '../../services/sesion/sesion.service';

import { SearchService } from '../../services/search/search.service';
import { Subscription } from 'rxjs';

import {NgbModal, ModalDismissReasons} from '@ng-bootstrap/ng-bootstrap';


@Component({
  selector: 'app-sistema',
  templateUrl: './sistema.component.html',
  styleUrls: ['./sistema.component.scss']
})
export class SistemaComponent implements OnInit,  AfterViewInit {

  public copy: string;

  public listado: any = [];
  public listadoCopy: any = [];

  public previsualizacion: string;
  public archivos: any = [];
  public loading: boolean;

  lista = true;

  myForm: FormGroup;

  accion : any = null; //0=crear 1=editar

  //Gradiente
  @ViewChild('gradiente') grad: ElementRef;
  color_a = "#f5365c";
  color_b = "#f56036";

  selectObj : any = null;
  selectObjIndex : number = null;

  inputTermino = '';
  searchSubscription : Subscription;

  public user_email: string = '';
  public user_id: number = null;

  constructor(private fb: FormBuilder,
              private validadores_serv: ValidadoresService,
              private api_serv: APIService,
              private sanitizer: DomSanitizer,
              private http: HttpClient,
              private renderer2: Renderer2,
              private sesion_serv: SesionService,
              private search_serv: SearchService,
              private modalService: NgbModal
    ) {

      this.color_a = this.sesion_serv.getColorA();
      this.color_b = this.sesion_serv.getColorB();
      this.crearFormulario();


     }

  ngOnInit() {
    this.user_email = this.sesion_serv.getUserEmail();
    this.user_id = this.sesion_serv.getUserId();
  }

  ngAfterViewInit() {
    this.setGradiente(this.color_a, this.color_b);
  }

 tratarError(msg : any){
    //token invalido/ausente o token expiro
    if(msg.status == 400 || msg.status == 401){ 
      Swal.fire({
        title: 'Warning',
        text: msg.error.error,
        icon: 'warning'
      });
    }
    else { 
      Swal.fire({
        title: 'Error',
        text: msg.error.error,
        icon: 'error'
      });
    }

  }

  setGradiente(Color_a : string = this.color_a, Color_b : string = this.color_b) : void {
    //style="background: linear-gradient(87deg, {{color_a}} 0, {{color_b}} 100%) !important;"
    const Gradiente = this.grad.nativeElement;
    //console.log(Gradiente);
    this.renderer2.setStyle(Gradiente, 'background', `linear-gradient(87deg, ${ Color_a } 0, ${ Color_b } 100%)`);
  }

  crearFormulario() {

    this.myForm = this.fb.group({
        password1  : ['', [ Validators.required, Validators.maxLength(50) ]  ],       
        password2  : ['', [ Validators.required, Validators.maxLength(50) ]  ],
        password3  : ['', [ Validators.required, Validators.maxLength(50) ]  ],
      });
    
  }

  get password1NoValido() {
    return this.myForm.get('password1').invalid && this.myForm.get('password1').touched;
  }

  get password2NoValido() {
    return this.myForm.get('password2').invalid && this.myForm.get('password2').touched;
  }

  get password3NoValido() {
    const password2 = this.myForm.get('password2').value;
    const password3 = this.myForm.get('password3').value;

    return ( password2 === password3 ) ? false : true;
  }

  guardar(): void {
    console.log( this.myForm );

    if ( this.myForm.invalid ) {

      return Object.values( this.myForm.controls ).forEach( control => {
        
        if ( control instanceof FormGroup ) {
          Object.values( control.controls ).forEach( control => control.markAsTouched() );
        } else {
          control.markAsTouched();
        }
 
      });
     
    }else{

      if (this.myForm.value.password2 != this.myForm.value.password3) {
        Swal.fire({
          title: 'Warning',
          text: 'Las contraseñas de coinciden.',
          icon: 'warning'
        });  
      }else{
        this.Ingresar();
      }

    }
  }

  Ingresar(){
   
    var datos= {
      email: this.user_email,
      password: this.myForm.value.password1
    };

    Swal.fire({
      title: 'Espere',
      text: 'Validando...',
      icon: 'info',
      allowOutsideClick: false
    });
    Swal.showLoading();

    var that = this;

    this.api_serv.postQuery('auth/login/web', datos)
    .subscribe({
      next(data : any) {
        console.log(data);
        Swal.close ();
        that.editar();
        
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

  editar(): void {

    var datos = {
      password : this.myForm.value.password2,
    };

    Swal.fire({
      title: 'Espere',
      text: 'Ejecutando',
      icon: 'info',
      allowOutsideClick: false
    });
    Swal.showLoading();

    var that = this;

    this.api_serv.putQuery(`usuarios/${ this.user_id }`, datos)
    .subscribe({
      next(data : any) {
        console.log(data);
        
        that.myForm.reset({});
        Swal.fire({
          title: 'Info',
          text: data.message,
          icon: 'info',
        });

      },
      error(msg) {
        console.log(msg);

        that.tratarError(msg);

      }
    });

  }

  

}
