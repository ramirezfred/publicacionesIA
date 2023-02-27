import { Component, OnInit, AfterViewInit, ElementRef, ViewChild, Renderer2, Injectable } from '@angular/core';
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

import {NgbCalendar, NgbDate, NgbDateAdapter, NgbDateParserFormatter, NgbDateStruct} from '@ng-bootstrap/ng-bootstrap';

import { saveAs } from 'file-saver';

import * as XLSX from 'xlsx';

/**
 * This Service handles how the date is represented in scripts i.e. ngModel.
 */
 @Injectable()
 export class CustomAdapter extends NgbDateAdapter<string> {
 
   readonly DELIMITER = '-';
 
   fromModel(value: string | null): NgbDateStruct | null {
     if (value) {
       const date = value.split(this.DELIMITER);
       return {
         day : parseInt(date[0], 10),
         month : parseInt(date[1], 10),
         year : parseInt(date[2], 10)
       };
     }
     return null;
   }
 
   toModel(date: NgbDateStruct | null): string | null {
     return date ? date.day + this.DELIMITER + date.month + this.DELIMITER + date.year : null;
   }
 }
 
 /**
  * This Service handles how the date is rendered and parsed from keyboard i.e. in the bound input field.
  */
 @Injectable()
 export class CustomDateParserFormatter extends NgbDateParserFormatter {
 
   readonly DELIMITER = '-';
 
   parse(value: string): NgbDateStruct | null {
     if (value) {
       const date = value.split(this.DELIMITER);
       return {
         day : parseInt(date[0], 10),
         month : parseInt(date[1], 10),
         year : parseInt(date[2], 10)
       };
     }
     return null;
   }
 
   format(date: NgbDateStruct | null): string {
     return date ? date.day + this.DELIMITER + date.month + this.DELIMITER + date.year : '';
   }
 }

@Component({
  selector: 'app-movimientos',
  templateUrl: './movimientos.component.html',
  styleUrls: ['./movimientos.component.scss'],

  // NOTE: For this example we are only providing current component, but probably
  // NOTE: you will want to provide your main App Module
  providers: [
    {provide: NgbDateAdapter, useClass: CustomAdapter},
    {provide: NgbDateParserFormatter, useClass: CustomDateParserFormatter}
  ]

})
export class MovimientosComponent implements OnInit,  AfterViewInit {

  public copy: string;

  public listado: any = [];
  public listadoCopy: any = [];

  public previsualizacion: string;
  public archivos: any = [];
  public loading: boolean;

  lista = true;

  myForm: FormGroup;
  myFormFilter: FormGroup;

  accion : any = null; //0=crear 1=editar

  //Gradiente
  @ViewChild('gradiente') grad: ElementRef;
  color_a = "#f5365c";
  color_b = "#f56036";

  selectObj : any = null;
  selectObjIndex : number = null;

  @ViewChild(MatPaginator) paginador1: MatPaginator;
  pageSize1 = 20;
  desde1 :number =0;
  hasta1 :number =20;

  inputTermino = '';
  searchSubscription : Subscription;

  tipos = [
    {id: 1, nombre: 'Ingreso'},
    {id: 2, nombre: 'Egreso'},
  ];

  formas = [
    {id: 1, nombre: 'Transferencia'},
    {id: 2, nombre: 'Depósito'},
    {id: 3, nombre: 'Cheque'},
    {id: 4, nombre: 'Efectivo'},
  ];
  
  ingresos = 0;
  egresos = 0;
  total = 0;
  saldo = 0;
  cantidad = 0;

  familias = [];
  cuentas = [];
  obras = [];
  partidas = [];

  model1: string;
  model2: string;
  model3: string;

  concepto = '';

  @ViewChild('content_print') content_print : ElementRef;

  constructor(private fb: FormBuilder,
              private validadores_serv: ValidadoresService,
              private api_serv: APIService,
              private sanitizer: DomSanitizer,
              private http: HttpClient,
              private renderer2: Renderer2,
              private sesion_serv: SesionService,
              private search_serv: SearchService,
              private modalService: NgbModal,
              private ngbCalendar: NgbCalendar,
              private dateAdapter: NgbDateAdapter<string>,

    ) {

      this.color_a = this.sesion_serv.getColorA();
      this.color_b = this.sesion_serv.getColorB();
      this.crearFormulario(0);
      this.crearFormularioFilter();

     }

  ngOnInit() {

    this.searchSubscription = this.search_serv.buscar$.subscribe( termino => {
      this.inputTermino = termino;
      this.FilterByTermino();
      //console.log(termino);
    });

    this.model1 = this.today;
    this.model2 = this.today;
    this.myFormFilter.patchValue({fecha_i : this.model1});
    this.myFormFilter.patchValue({fecha_f : this.model2});
    
    this.getLista();
    this.getFamilias();
    this.getCuentas();
    this.getObras();
    this.getPartidas();
  }

  ngAfterViewInit() {
    this.setGradiente(this.color_a, this.color_b);
  }

  FilterByTermino(){
    let filteredItems = [];
    let origen = JSON.parse(JSON.stringify(this.listadoCopy));
    if(this.inputTermino != ""){
      for (var i = 0; i < this.listado.length; ++i) {
        if (this.listado[i].fecha.toUpperCase().indexOf(this.inputTermino.toUpperCase())>=0) {
          filteredItems.push(this.listado[i]);
        }else if (this.listado[i].cuenta.codigo.toUpperCase().indexOf(this.inputTermino.toUpperCase())>=0) {
          filteredItems.push(this.listado[i]);
        }else if (this.listado[i].familia.nombre.toUpperCase().indexOf(this.inputTermino.toUpperCase())>=0) {
          filteredItems.push(this.listado[i]);
        }else if (this.listado[i].obra.nombre.toUpperCase().indexOf(this.inputTermino.toUpperCase())>=0) {
          filteredItems.push(this.listado[i]);
        }else if (this.listado[i].concepto.toUpperCase().indexOf(this.inputTermino.toUpperCase())>=0) {
          filteredItems.push(this.listado[i]);
        }else if (this.listado[i].nro.toUpperCase().indexOf(this.inputTermino.toUpperCase())>=0) {
          filteredItems.push(this.listado[i]);
        }else if (this.listado[i].forma_nombre.toUpperCase().indexOf(this.inputTermino.toUpperCase())>=0) {
          filteredItems.push(this.listado[i]);
        }else if (this.listado[i].partida.nombre.toUpperCase().indexOf(this.inputTermino.toUpperCase())>=0) {
          filteredItems.push(this.listado[i]);
        }
      }
    }else{
      filteredItems = origen;
    }

    this.listado = filteredItems;
    this.rebootPag1();
    //console.log(this.listado);
    this.calcularTotales();
    
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
    this.hasta1 = 20;
    this.paginador1.firstPage();
  }

  cambiarpagina1(e:PageEvent){
    //console.log(e);
    this.desde1 = e.pageIndex * e.pageSize;
    this.hasta1 = this.desde1 + e.pageSize;
    //console.log(this.desde1);
    //console.log(this.hasta1);
  }

  get today() {
    return this.dateAdapter.toModel(this.ngbCalendar.getToday())!;
  }

  setGradiente(Color_a : string = this.color_a, Color_b : string = this.color_b) : void {
    //style="background: linear-gradient(87deg, {{color_a}} 0, {{color_b}} 100%) !important;"
    const Gradiente = this.grad.nativeElement;
    //console.log(Gradiente);
    this.renderer2.setStyle(Gradiente, 'background', `linear-gradient(87deg, ${ Color_a } 0, ${ Color_b } 100%)`);
  }

  getLista() {

    this.ingresos = 0;
    this.egresos = 0;
    this.total = 0;

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

    var datos = {
      familia_id : this.myFormFilter.value.familia_id,
      cuenta_id : this.myFormFilter.value.cuenta_id,
      obra_id : this.myFormFilter.value.obra_id,
      partida_id : this.myFormFilter.value.partida_id,
      concepto : this.myFormFilter.value.concepto,
      tipo : this.myFormFilter.value.tipo,
      fecha_i : this.myFormFilter.value.fecha_i,
      fecha_f : this.myFormFilter.value.fecha_f,
      forma : this.myFormFilter.value.forma,
      nro : this.myFormFilter.value.nro,
    };

    this.api_serv.postQuery(`movimientos_filter`,datos)
    .subscribe({
      next(data : any) {
        console.log(data);
        that.listado = data.movimientos;
        that.listadoCopy = that.listado;
        that.rebootPag1();
        that.calcularTotales();
        Swal.close ();
      },
      error(msg) {
        console.log(msg);

        that.tratarError(msg);

      }
    });
  }

  calcularTotales(){
    this.ingresos = 0;
    this.egresos = 0;
    this.total = 0;
    this.cantidad = 0;

    for (var i = 0; i < this.listado.length; ++i) {
      if(this.listado[i].forma == 1){
        this.listado[i].forma_nombre = 'Transferencia';
      }else if(this.listado[i].forma == 2){
        this.listado[i].forma_nombre = 'Depósito';
      }else if(this.listado[i].forma == 3){
        this.listado[i].forma_nombre = 'Cheque';
      }else if(this.listado[i].forma == 4){
        this.listado[i].forma_nombre = 'Efectivo';
      }

      if(this.listado[i].tipo == 1){
        //Ingreso
        this.ingresos = this.ingresos + parseFloat(this.listado[i].monto);
        this.listado[i].ingreso = parseFloat(this.listado[i].monto);
        this.listado[i].egreso = null;

        if (i==0) {
          this.listado[i].saldo = this.listado[i].ingreso;
        }else{
          this.listado[i].saldo = this.listado[i-1].saldo + this.listado[i].ingreso;
        }
      }else if(this.listado[i].tipo == 2){
        //Egreso
        this.egresos = this.egresos + parseFloat(this.listado[i].monto);
        this.listado[i].egreso = parseFloat(this.listado[i].monto);
        this.listado[i].ingreso = null;

        if (i==0) {
          this.listado[i].saldo = -1*this.listado[i].egreso;
        }else{
          this.listado[i].saldo = this.listado[i-1].saldo - this.listado[i].egreso;
        }
      } 

      if(this.listado[i].cantidad){
        this.cantidad = this.cantidad + parseFloat(this.listado[i].cantidad);
      }
      
    }

    //this.egresos = -1*this.egresos;
    this.total = this.ingresos - this.egresos;

    console.log(this.cantidad);
  }

  getFamilias() {

    this.familias = [];
    var that = this;

    this.api_serv.getQuery(`familias`)
    .subscribe({
      next(data : any) {
        console.log(data);
        that.familias = data.familias;
      },
      error(msg) {
        console.log(msg);
        that.tratarError(msg);
      }
    });
  }

  getCuentas() {

    this.cuentas = [];
    var that = this;

    this.api_serv.getQuery(`cuentas`)
    .subscribe({
      next(data : any) {
        console.log(data);
        that.cuentas = data.cuentas;
      },
      error(msg) {
        console.log(msg);
        that.tratarError(msg);
      }
    });
  }

  getObras() {

    this.obras = [];
    var that = this;

    this.api_serv.getQuery(`obras`)
    .subscribe({
      next(data : any) {
        console.log(data);
        that.obras = data.obras;
      },
      error(msg) {
        console.log(msg);
        that.tratarError(msg);
      }
    });
  }

  getPartidas() {

    this.partidas = [];
    var that = this;

    this.api_serv.getQuery(`partidas`)
    .subscribe({
      next(data : any) {
        console.log(data);
        that.partidas = data.partidas;
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
        fecha  : ['', [ Validators.required ]  ],       
        tipo  : ['', [ Validators.required ]  ],
        obra_id  : ['', [ Validators.required ]  ],
        concepto  : ['', [ Validators.required, Validators.maxLength(250) ]  ],
        nro  : ['', [ Validators.required, Validators.minLength(2) ]  ],
        monto  : ['', [ Validators.required, Validators.min(0) ]  ],
        forma  : ['', [ Validators.required ]  ],
        partida_id  : ['', [ Validators.required ]  ],
        cuenta_id  : ['', [ Validators.required ]  ],
        familia_id  : ['', [ Validators.required ]  ],
        estimacion  : ['', [ Validators.required, Validators.minLength(2) ]  ],
        unidad  : ['', [ Validators.required, Validators.minLength(2) ]  ],
        cantidad  : ['', [ Validators.required, Validators.min(0) ]  ],
      });  

      if(this.concepto != null && this.concepto != ''){
        this.myForm.patchValue({concepto : this.concepto});
      }else if(this.listado.length > 0){
        this.myForm.patchValue({concepto : this.listado[this.listado.length - 1].concepto});
      }
    
    }else{
      this.accion = accion;
      this.myForm = this.fb.group({
        fecha  : ['', [ Validators.required ]  ],       
        tipo  : ['', [ Validators.required ]  ],
        obra_id  : ['', [ Validators.required ]  ],
        concepto  : ['', [ Validators.required, Validators.maxLength(250) ]  ],
        nro  : ['', [ Validators.required, Validators.minLength(2) ]  ],
        monto  : ['', [ Validators.required ]  ],
        forma  : ['', [ Validators.required ]  ],
        partida_id  : ['', [ Validators.required ]  ],
        cuenta_id  : ['', [ Validators.required ]  ],
        familia_id  : ['', [ Validators.required ]  ],
        estimacion  : ['', [ Validators.required, Validators.minLength(2) ]  ],
        unidad  : ['', [ Validators.required, Validators.minLength(2) ]  ],
        cantidad  : ['', [ Validators.required, Validators.min(0) ]  ],
      }); 
    }
    
  }

  get fechaNoValido() {
    return this.myForm.get('fecha').invalid && this.myForm.get('fecha').touched;
  }

  get tipoNoValido() {
    return this.myForm.get('tipo').invalid && this.myForm.get('tipo').touched
  }

  get obra_idNoValido() {
    return this.myForm.get('obra_id').invalid && this.myForm.get('obra_id').touched
  }

  get conceptoNoValido() {
    return this.myForm.get('concepto').invalid && this.myForm.get('concepto').touched
  }

  get nroNoValido() {
    return this.myForm.get('nro').invalid && this.myForm.get('nro').touched
  }

  get montoNoValido() {
    return this.myForm.get('monto').invalid && this.myForm.get('monto').touched
  }

  get formaNoValido() {
    return this.myForm.get('forma').invalid && this.myForm.get('forma').touched
  }

  get partida_idNoValido() {
    return this.myForm.get('partida_id').invalid && this.myForm.get('partida_id').touched
  }

  get cuenta_idNoValido() {
    return this.myForm.get('cuenta_id').invalid && this.myForm.get('cuenta_id').touched
  }

  get familia_idNoValido() {
    return this.myForm.get('familia_id').invalid && this.myForm.get('familia_id').touched
  }

  get estimacionNoValido() {
    return this.myForm.get('estimacion').invalid && this.myForm.get('estimacion').touched
  }

  get unidadNoValido() {
    return this.myForm.get('unidad').invalid && this.myForm.get('unidad').touched
  }

  get cantidadNoValido() {
    return this.myForm.get('cantidad').invalid && this.myForm.get('cantidad').touched
  }

  crearFormularioFilter(){
    this.myFormFilter = this.fb.group({
        familia_id  : [''],
        cuenta_id  : [''],
        obra_id  : [''],
        partida_id  : [''],
        concepto  : [''],
        tipo  : [''],
        fecha_i  : [''],       
        fecha_f  : [''],
        forma  : [''],
        nro  : [''],
      });
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
    this.model3 = this.today;
  }

  aEditar(item, index: number): void {
    this.lista = false;
    this.crearFormulario(1);

    //this.selectObj = Object.assign({},obj);
    this.selectObj = JSON.parse(JSON.stringify(item));
    this.selectObjIndex = index;

    //this.myForm.patchValue({fecha : this.selectObj.fecha});
    this.myForm.patchValue({tipo : this.selectObj.tipo});
    this.myForm.patchValue({obra_id : this.selectObj.obra.id});
    this.myForm.patchValue({concepto : this.selectObj.concepto});
    this.myForm.patchValue({nro : this.selectObj.nro});
    this.myForm.patchValue({monto : this.selectObj.monto});
    this.myForm.patchValue({forma : this.selectObj.forma});
    this.myForm.patchValue({cuenta_id : this.selectObj.cuenta.id});
    this.myForm.patchValue({partida_id : this.selectObj.partida.id});
    this.myForm.patchValue({familia_id : this.selectObj.familia.id});
    this.myForm.patchValue({estimacion : this.selectObj.estimacion});
    this.myForm.patchValue({unidad : this.selectObj.unidad});
    this.myForm.patchValue({cantidad : this.selectObj.cantidad});

    this.model3 = this.selectObj.fecha;
  }

  guardar(c3): void {
    
    if(!c3.valid){ 
      Swal.fire({
        title: 'Warning',
        text: 'Fecha inválida',
        icon: 'warning'
      });
    }
    else if(!this.model3 || this.model3 == ''){ 
      Swal.fire({
        title: 'Warning',
        text: 'Seleccione un fecha',
        icon: 'warning'
      });
    }else{
      
      this.myForm.patchValue({fecha : this.model3});

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
  }

  crear(): void {
    
    var datos = {
      fecha : this.myForm.value.fecha,
      tipo : this.myForm.value.tipo,
      obra_id : this.myForm.value.obra_id,
      concepto : this.myForm.value.concepto,
      nro : this.myForm.value.nro,
      monto : this.myForm.value.monto,
      forma : this.myForm.value.forma,
      partida_id : this.myForm.value.partida_id,
      cuenta_id : this.myForm.value.cuenta_id,
      familia_id : this.myForm.value.familia_id,
      estimacion : this.myForm.value.estimacion,
      unidad : this.myForm.value.unidad,
      cantidad : this.myForm.value.cantidad,
    };

    this.concepto = this.myForm.value.concepto;

    Swal.fire({
      title: 'Espere',
      text: 'Ejecutando',
      icon: 'info',
      allowOutsideClick: false
    });
    Swal.showLoading();

    var that = this;

    this.api_serv.postQuery('movimientos', datos)
    .subscribe({
      next(data : any) {
        console.log(data);
        
        that.myForm.reset({});
        that.listado.push(data.movimiento);
        that.calcularTotales();
        that.myForm.patchValue({concepto : that.concepto});

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
      fecha : this.myForm.value.fecha,
      tipo : this.myForm.value.tipo,
      obra_id : this.myForm.value.obra_id,
      concepto : this.myForm.value.concepto,
      nro : this.myForm.value.nro,
      monto : this.myForm.value.monto,
      forma : this.myForm.value.forma,
      partida_id : this.myForm.value.partida_id,
      cuenta_id : this.myForm.value.cuenta_id,
      familia_id : this.myForm.value.familia_id,
      estimacion : this.myForm.value.estimacion,
      unidad : this.myForm.value.unidad,
      cantidad : this.myForm.value.cantidad,
    };

    Swal.fire({
      title: 'Espere',
      text: 'Ejecutando',
      icon: 'info',
      allowOutsideClick: false
    });
    Swal.showLoading();

    var that = this;

    this.api_serv.putQuery(`movimientos/${ this.selectObj.id }`, datos)
    .subscribe({
      next(data : any) {
        console.log(data);

        if(data.movimiento.forma == 1){
          data.movimiento.forma_nombre = 'Transferencia';
        }else if(data.movimiento.forma == 2){
          data.movimiento.forma_nombre = 'Depósito';
        }else if(data.movimiento.forma == 3){
          data.movimiento.forma_nombre = 'Cheque';
        }else if(data.movimiento.forma == 4){
          data.movimiento.forma_nombre = 'Efectivo';
        }
        
        that.listado[that.selectObjIndex] = data.movimiento;
        that.calcularTotales();

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
      text: `Está seguro que desea eliminar el movimiento # ${ item.nro }`,
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
    
        this.api_serv.deleteQuery(`movimientos/${ item.id }`)
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

  filtrar(c1,c2): void {
    

    if(this.model1 || this.model1 != '' || this.model2 || this.model2 != ''){
      if(!c1.valid){ 
        Swal.fire({
          title: 'Warning',
          text: 'Fecha < Desde > inválida',
          icon: 'warning'
        });
      }
      else if(!c2.valid){ 
        Swal.fire({
          title: 'Warning',
          text: 'Fecha < Hasta > inválida',
          icon: 'warning'
        });
      }
      else if(!this.model1 || this.model1 == ''){ 
        Swal.fire({
          title: 'Warning',
          text: 'Seleccione un fecha < Desde >',
          icon: 'warning'
        });
      }
      else if (!this.model2 || this.model2 == '') {
        Swal.fire({
          title: 'Warning',
          text: 'Seleccione un fecha < Hasta >',
          icon: 'warning'
        });
      }else{
        this.myFormFilter.patchValue({fecha_i : this.model1});
        this.myFormFilter.patchValue({fecha_f : this.model2});
        this.getLista();
      }
    }else{
      this.myFormFilter.patchValue({fecha_i : ''});
      this.myFormFilter.patchValue({fecha_f : ''});
      this.getLista();

    }

    console.log( this.myFormFilter );
  }

  public saveFile(){
    //var FileSaver = require('file-saver');
    // var blob = new Blob ([document.getElementById('exportable').innerHTML],{
    //   type: "application/vnd.openxmlfortmats-officedocument.spreadsheetml.sheet;charset=ISO-8859-1"
    // });
    var blob = new Blob ([document.getElementById('exportable').innerHTML],{
      type: "application/vnd.openxmlfortmats-officedocument.spreadsheetml.sheet;charset=utf-8"
    });
    
    var hoy = new Date();
    var fecha = hoy.getDate() + '-' + ( hoy.getMonth() + 1 ) + '-' + hoy.getFullYear();
    var hora = hoy.getHours() + ':' + hoy.getMinutes() + ':' + hoy.getSeconds();
    var fechaYHora = fecha + ' ' + hora;
    //Obteniendo una variable con la máscara d-m-Y H:i:s

    saveAs(blob,'movimientos'+fechaYHora+'.xls');

    /*var archivo = new File([document.getElementById('exportable').innerHTML], 'prueba.xls', {
      type: "application/vnd.openxmlfortmats-officedocument.spreadsheetml.sheet;charset=utf-8"
    });*/
    //saveAs(archivo);
  }

  print(): void {
    let printContents, popupWin;
    //printContents = document.getElementById('print-section').innerHTML;
    printContents = this.content_print.nativeElement.innerHTML;

    popupWin = window.open('', '_blank', 'top=0,left=0,height=100%,width=auto');
    //popupWin.document.open();
    popupWin.document.write(`
      <html>
        <head>
          <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0-beta.2/css/bootstrap.min.css" integrity="sha384-PsH8R72JQ3SOdhVi3uxftmaW6Vc51MKb0q5P2rRUpPvrszuE4W1povHYgTpBfshb" crossorigin="anonymous">
          
          <style>
            @media print {
              @page { margin: 0; }
              body { margin: 1.6cm; }
              .col-sm-1, .col-sm-2, .col-sm-3, .col-sm-4, .col-sm-5, .col-sm-6, .col-sm-7, .col-sm-8, .col-sm-9, .col-sm-10, .col-sm-11, .col-sm-12 {
                    float: left;
               }
               .col-sm-12 {
                    width: 100%;
               }
               .col-sm-9 {
                    width: 75%;
               }
               .col-sm-3 {
                    width: 25%;
               }
               .form-control-static {
                 margin-bottom: 0px;
               }
            }
          </style>

        </head>

      <body > ${printContents} </body>
      </html>`
    );
    popupWin.document.close();
    popupWin.focus();
    popupWin.print();
    //popupWin.close();
  }


  exportExcel(): void {

    let data_excel = [];

    for (var i = 0; i < this.listado.length; ++i) {
      let item = {
        FECHA: this.listado[i].fecha,
        INGRESO: this.listado[i].ingreso,
        EGRESO: this.listado[i].egreso, 
        SALDO: this.listado[i].saldo,
        FORMA_DE_PAGO: this.listado[i].forma_nombre,
        NO_DE_ESTIMACION: this.listado[i].estimacion,
        OBRA: this.listado[i].obra.nombre,
        PARTIDA: this.listado[i].partida.nombre,
        CUENTA: this.listado[i].cuenta.nombre,
        FAMILIA: this.listado[i].familia.nombre,
        CONCEPTO: this.listado[i].concepto,
        UNIDAD: this.listado[i].unidad,
        CANTIDAD: parseInt(this.listado[i].cantidad),
      };

      data_excel.push(item);
    }

    let item_total = {
      FECHA: 'TOTALES',
      INGRESO: this.ingresos,
      EGRESO: this.egresos, 
      SALDO: this.total,
      FORMA_DE_PAGO: '',
      NO_DE_ESTIMACION: '',
      OBRA: '',
      PARTIDA: '',
      CUENTA: '',
      FAMILIA: '',
      CONCEPTO: '',
      UNIDAD: '',
      CANTIDAD: this.cantidad,
    };

    data_excel.push(item_total);

    var hoy = new Date();
    var fecha = hoy.getDate() + '-' + ( hoy.getMonth() + 1 ) + '-' + hoy.getFullYear();
    var hora = hoy.getHours() + ':' + hoy.getMinutes() + ':' + hoy.getSeconds();
    var fechaYHora = fecha + ' ' + hora;
    //Obteniendo una variable con la máscara d-m-Y H:i:s

    const fileName = 'movimientos'+fechaYHora+'.xlsx';

    //const fileName = 'archivo.xlsx';
    // const worksheet = XLSX.utils.json_to_sheet([
    //   { col1: 'dato1', col2: 'dato2', col3: 'dato3' },
    //   { col1: 'dato4', col2: 'dato5', col3: 'dato6' },
    //   { col1: 'dato7', col2: 'dato8', col3: 'dato9' }
    // ]);
    const worksheet = XLSX.utils.json_to_sheet(data_excel);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Hoja1');
    XLSX.writeFile(workbook, fileName);
  }

}
