import { Component, OnInit, AfterViewInit, ElementRef, ViewChild, Renderer2 } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray, NgForm } from '@angular/forms';
import { ValidadoresService } from '../../services/validadores/validadores.service';
import { APIService } from '../../services/API/API.service';
import Swal from 'sweetalert2';
import { DomSanitizer } from '@angular/platform-browser';

import { HttpClient, HttpHeaders } from '@angular/common/http';
import { SesionService } from '../../services/sesion/sesion.service';

import { PageEvent, MatPaginator } from '@angular/material/paginator';

import { SearchService } from '../../services/search/search.service';
import { Subscription } from 'rxjs';

import {NgbModal, ModalDismissReasons} from '@ng-bootstrap/ng-bootstrap';


@Component({
  selector: 'app-obras',
  templateUrl: './obras.component.html',
  styleUrls: ['./obras.component.scss']
})
export class ObrasComponent implements OnInit,  AfterViewInit {

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

  @ViewChild(MatPaginator) paginador1: MatPaginator;
  pageSize1 = 5;
  desde1 :number =0;
  hasta1 :number =5;

  inputTermino = '';
  searchSubscription : Subscription;

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
      this.crearFormulario(0);


     }

  ngOnInit() {

    this.searchSubscription = this.search_serv.buscar$.subscribe( termino => {
      this.inputTermino = termino;
      this.FilterByTermino();
      //console.log(termino);
    });
    
    this.getLista();
  }

  ngAfterViewInit() {
    this.setGradiente(this.color_a, this.color_b);
  }

  FilterByTermino(){
    let filteredItems = [];
    let origen = JSON.parse(JSON.stringify(this.listadoCopy));
    if(this.inputTermino != ""){
      for (var i = 0; i < this.listado.length; ++i) {
        if (this.listado[i].nombre.toUpperCase().indexOf(this.inputTermino.toUpperCase())>=0) {
          filteredItems.push(this.listado[i]);
        }else if (this.listado[i].codigo.toUpperCase().indexOf(this.inputTermino.toUpperCase())>=0) {
          filteredItems.push(this.listado[i]);
        }
      }
    }else{
      filteredItems = origen;
    }

    this.listado = filteredItems;
    this.rebootPag1();
    //console.log(this.listado);
    
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

  rebootPag1(){
    this.desde1 = 0;
    this.hasta1 = 5;
    this.paginador1.firstPage();
  }

  cambiarpagina1(e:PageEvent){
    //console.log(e);
    this.desde1 = e.pageIndex * e.pageSize;
    this.hasta1 = this.desde1 + e.pageSize;
    //console.log(this.desde1);
    //console.log(this.hasta1);
  }

  setGradiente(Color_a : string = this.color_a, Color_b : string = this.color_b) : void {
    //style="background: linear-gradient(87deg, {{color_a}} 0, {{color_b}} 100%) !important;"
    const Gradiente = this.grad.nativeElement;
    //console.log(Gradiente);
    this.renderer2.setStyle(Gradiente, 'background', `linear-gradient(87deg, ${ Color_a } 0, ${ Color_b } 100%)`);
  }

  getLista() {

    this.listado = [];
    this.listadoCopy = [];

    Swal.fire({
      title: 'Espere',
      text: 'Consultando',
      icon: 'info',
      allowOutsideClick: false
    });
    Swal.showLoading();

    var that = this;

    this.api_serv.getQuery(`obras`)
    .subscribe({
      next(data : any) {
        console.log(data);
        that.listado = data.obras;
        that.listadoCopy = that.listado;
        that.rebootPag1();
        Swal.close ();
      },
      error(msg) {
        console.log(msg);

        that.tratarError(msg);

      }
    });
  }

  //accion 0=crear 1=editar
  crearFormulario(accion : number = 0) {

    if (accion == 0) {

      // Gradiente original
      // #f5365c 0, #f56036 100%

      this.accion = accion;
      this.myForm = this.fb.group({
        codigo  : ['', [ Validators.required, Validators.minLength(5) ]  ],       
        nombre  : ['', [ Validators.required, Validators.minLength(2) ]  ],
      });     
    
    }else{
      this.accion = accion;
      this.myForm = this.fb.group({
        codigo  : ['', [ Validators.required, Validators.minLength(5) ]  ],    
        nombre  : ['', [ Validators.required, Validators.minLength(2) ]  ],
      }); 
    }
    
  }

  get codigoNoValido() {
    return this.myForm.get('codigo').invalid && this.myForm.get('codigo').touched;
  }

  get nombreNoValido() {
    return this.myForm.get('nombre').invalid && this.myForm.get('nombre').touched
  }

  atras(): void {
    //this.setGradiente(this.color_a, this.color_b);
    this.lista = true;
    this.accion = null;
    this.selectObj = null;
    this.selectObjIndex = null;
  }

  aCrear(): void {
    this.lista = false;
    this.crearFormulario(0);
    //this.clearImage();
  }

  aEditar(item, index: number): void {
    this.lista = false;
    this.crearFormulario(1);

    //this.selectObj = Object.assign({},obj);
    this.selectObj = JSON.parse(JSON.stringify(item));
    this.selectObjIndex = index;

    this.myForm.patchValue({codigo : this.selectObj.codigo});
    this.myForm.patchValue({nombre : this.selectObj.nombre});

    /* Swal.fire({
      title: 'Info',
      text: 'En construcción',
      icon: 'info',
    }); */
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
      if (this.accion == 0) {
        this.crear();
      }else if (this.accion == 1) {

        this.editar();
        
      }
    }
  }

  crear(): void {
    
    var datos = {
      codigo : this.myForm.value.codigo,
      nombre : this.myForm.value.nombre,
    };

    Swal.fire({
      title: 'Espere',
      text: 'Ejecutando',
      icon: 'info',
      allowOutsideClick: false
    });
    Swal.showLoading();

    var that = this;

    this.api_serv.postQuery('obras', datos)
    .subscribe({
      next(data : any) {
        console.log(data);
        
        that.myForm.reset({});
        that.listado.push(data.obra);

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

  editar(): void {

    var datos = {
      codigo : this.myForm.value.codigo,
      nombre : this.myForm.value.nombre,
    };

    Swal.fire({
      title: 'Espere',
      text: 'Ejecutando',
      icon: 'info',
      allowOutsideClick: false
    });
    Swal.showLoading();

    var that = this;

    this.api_serv.putQuery(`obras/${ this.selectObj.id }`, datos)
    .subscribe({
      next(data : any) {
        console.log(data);
        
        that.listado[that.selectObjIndex] = data.obra;

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

  eliminar( item, index: number ) {

    Swal.fire({
      title: '¿Está seguro?',
      text: `Está seguro que desea eliminar a ${ item.nombre }`,
      icon: 'question',
      showConfirmButton: true,
      showCancelButton: true
    }).then( resp => {

      if ( resp.value ) {

        Swal.fire({
          title: 'Espere',
          text: 'Ejecutando',
          icon: 'info',
          allowOutsideClick: false
        });
        Swal.showLoading();
    
        var that = this;
    
        this.api_serv.deleteQuery(`obras/${ item.id }`)
        .subscribe({
          next(data : any) {
            console.log(data);
            
            that.listado.splice(index, 1);
    
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

    });

  }

}
