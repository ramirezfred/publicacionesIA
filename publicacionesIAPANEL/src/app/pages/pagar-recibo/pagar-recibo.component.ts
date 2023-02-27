import { Component, OnInit, AfterViewInit, ElementRef, ViewChild, Renderer2, OnDestroy } from '@angular/core';

//Mis imports
import { HttpClient } from '@angular/common/http';
import { APIService } from '../../services/API/API.service';
import { Router, ActivatedRoute } from '@angular/router';
import Swal from 'sweetalert2';
import { SesionService } from '../../services/sesion/sesion.service';

import { DomSanitizer } from '@angular/platform-browser';

import { LogoService } from '../../services/logo/logo.service';

declare let paypal: any;

@Component({
  selector: 'app-pagar-recibo',
  templateUrl: './pagar-recibo.component.html',
  styleUrls: ['./pagar-recibo.component.scss']
})
export class PagarReciboComponent implements OnInit, OnDestroy {

	private data:any;
	//public loading = false;
	submitted = false;

  recordarme = false;

  //Gradiente
  @ViewChild('gradiente') grad: ElementRef;
  color_a = "#dedede";
  color_b = "#4c7c94";

  recibo_id : any = null; 

  //cliente
  nombre : any = null;
  telefono : any = null;
  email : any = null;

  //recibo
  recibo : any = null;
  descripcion : any = null;
  monto : any = null;
  estado : any = null;
  fecha_recibo : any = null;
  fecha_pago : any = null;
  imagen : any = null;
  metodo : any = null;

  //deposito
  cuenta : any = null;
  beneficiario : any = null;
  banco : any = null;

  //paypal
  paypal_production : any = null;
  paypal_sandbox : any = null;
  paypal_env : any = null;

  public previsualizacion: string;
  public archivos: any = [];
  public loading: boolean;

  existe = false;

  cost = '1';
  currency = 'USD';
  selectedCurrency = "0";
  currencies = [
    {
      value: "0",
      viewValue: "Select Currency"
    },
     {
      "value": "USD",
      "viewValue": "US Dollar"
    },
    {
      "value": "MXN",
      "viewValue": "Pesos MX"
    },
    {
      "value": "PEN",
      "viewValue": "Soles PE"
    }];



  constructor(private http: HttpClient,
              private api_serv: APIService,
              private router: Router,
              private sesion_serv: SesionService,
              private sanitizer: DomSanitizer,
              private renderer2: Renderer2,
              private activatedRoute: ActivatedRoute,
              private logo_serv: LogoService,
    )
  {
    this.activatedRoute.params.subscribe( params => {
      console.log( params['id'] );

      this.recibo_id = params['id'];
    });

    
  }

  ngOnInit() {
    if(this.recibo_id){
      this.getRecibo(this.recibo_id);
    }

    this.loadExternalScript("https://www.paypalobjects.com/api/checkout.js");
  }
  ngOnDestroy() {
  }

  ngAfterViewInit() {
    this.setGradiente(this.color_a, this.color_b);
  }

  private loadExternalScript(scriptUrl: string) {
    return new Promise((resolve, reject) => {
      const scriptElement = document.createElement('script')
      scriptElement.src = scriptUrl
      scriptElement.onload = resolve
      document.body.appendChild(scriptElement)
    })
  }

  paymentSuccess(payment) {
    console.log(payment);
    if(payment.state == "approved" || payment.state == "completed" || payment.state == "COMPLETED"){
      // Swal.fire({
      //   title: 'Info',
      //   text: 'Pago completado',
      //   icon: 'info',
      // });
      this.pagarPayPal();
    }else{
      Swal.fire({
        title: 'Error',
        text: 'Error al procesar el pago.',
        icon: 'error'
      });
    }
  }

  renderButtonPayPal(cost,selectedCurreny,self,paypal_production,paypal_sandbox,paypal_env): void {

    console.log('renderButtonPayPal');

    document.getElementById("paypal-button").innerHTML = "";

    let env = null;
    if(paypal_env == 0){
      env = 'sandbox';
    }else if(paypal_env == 1){
      env = 'production';
    }

    //reset earlier inserted paypal button
    paypal.Button.render({
      env: env,
      client: {
        production: paypal_production,
        sandbox: paypal_sandbox
      },
      commit: true,
      payment: function (data, actions) {
        return actions.payment.create({
          payment: {
            transactions: [
              {
                amount: { total: cost, currency: selectedCurreny }
              }
            ]
          }
        })
      },
      onAuthorize: function (data, actions) {
        return actions.payment.execute().then(function (payment) {

          //alert('Payment Successful')
          self.paymentSuccess(payment);
          //console.log(payment)
        })
      }
    }, '#paypal-button');
  }


  setGradiente(Color_a : string = this.color_a, Color_b : string = this.color_b) : void {
    //style="background: linear-gradient(87deg, {{color_a}} 0, {{color_b}} 100%) !important;"
    const Gradiente = this.grad.nativeElement;
    //console.log(Gradiente);
    this.renderer2.setStyle(Gradiente, 'background', `linear-gradient(87deg, ${ Color_a } 0, ${ Color_b } 100%)`);
    //bg-gradient-danger
  }

  getRecibo(recibo_id){

    this.ressetInfo();
    this.existe = false;

    Swal.fire({
      title: 'Espere',
      text: 'Cargando',
      icon: 'info',
      allowOutsideClick: false
    });
    Swal.showLoading();
  
    var datos = {};

    var that = this;

    this.api_serv.getQuery(`recibos/show/info/cliente/${ recibo_id }`)
    .subscribe({
      next(data : any) {
        console.log(data);

        //cliente
        that.nombre = data.obj.cliente.usuario.nombre;
        that.telefono = data.obj.cliente.usuario.telefono;
        that.email = data.obj.cliente.usuario.email;

        //recibo
        that.recibo = data.obj.pago.nombre;
        that.descripcion = data.obj.pago.descripcion;
        that.monto = data.obj.monto;
        //that.estado = (data.obj.estado==0)?'No Pagado':(data.obj.estado==1)?'Por Aprobar':'Pagado';
        if(data.obj.estado==0){
          that.estado = 'No Pagado'
        }else if(data.obj.estado==1){
          that.estado = 'Por Aprobar'
        }else if(data.obj.estado==2){
          that.estado = 'Pagado'
        }
        that.fecha_recibo = data.obj.fecha_recibo;
        that.fecha_pago = data.obj.fecha_pago;
        that.imagen = data.obj.imagen;
        that.metodo = data.obj.metodo;

        that.previsualizacion = data.obj.imagen;

        //deposito
        that.cuenta = data.obj.pago.negocio.cuenta;
        that.beneficiario = data.obj.pago.negocio.beneficiario;
        that.banco = data.obj.pago.negocio.banco;

        //paypal
        that.paypal_production = data.obj.pago.negocio.paypal_production;
        that.paypal_sandbox = data.obj.pago.negocio.paypal_sandbox;
        that.paypal_env = data.obj.pago.negocio.paypal_env;

        that.setGradiente(data.obj.pago.negocio.color_a, data.obj.pago.negocio.color_b);
       
        that.logo_serv.logo_negocio$.emit(data.obj.pago.negocio.usuario.imagen);

        Swal.close ();

        that.existe = true;

        if(that.estado != 'Por Aprobar' && that.estado != 'Pagado'){

          if(that.paypal_production != null && that.paypal_production != '' &&
            that.paypal_sandbox != null && that.paypal_sandbox != ''){

            that.renderButtonPayPal(
              that.monto,
              'MXN',
              that,
              that.paypal_production,
              that.paypal_sandbox,
              that.paypal_env
              );
          }

        }

      },
      error(msg) {
        console.log(msg);

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
    });

  }

  ressetInfo(){
    //cliente
    this.nombre = null;
    this.telefono = null;
    this.email = null;

    //recibo
    this.recibo = null;
    this.descripcion = null;
    this.monto = null;
    this.estado = null;
    this.fecha_recibo = null;
    this.fecha_pago = null;
    this.imagen = null;
    this.metodo = null;

    this.previsualizacion = '';

    //deposito
    this.cuenta = null;
    this.beneficiario = null;
    this.banco = null;

    //paypal
    this.paypal_production = null;
    this.paypal_sandbox = null;
    this.paypal_env = null;
  }

  capturarFile(event): any {
    const archivoCapturado = event.target.files[0]
    this.extraerBase64(archivoCapturado).then((imagen: any) => {
      this.previsualizacion = imagen.base;
      console.log(imagen);

    })
    this.archivos.push(archivoCapturado)
    // 
    // console.log(event.target.files);

    setTimeout(()=>{
      this.subirArchivo();
    },200);

  }

  extraerBase64 = async ($event: any) => new Promise((resolve, reject) => {
    try {
      const unsafeImg = window.URL.createObjectURL($event);
      const image = this.sanitizer.bypassSecurityTrustUrl(unsafeImg);
      const reader = new FileReader();
      reader.readAsDataURL($event);
      reader.onload = () => {
        resolve({
          base: reader.result
        });
      };
      reader.onerror = error => {
        resolve({
          base: null
        });
      };

    } catch (e) {
      return null;
    }
  })


  /**
   * Limpiar imagen
   */
  clearImage(): any {
    this.previsualizacion = '';
    this.archivos = [];
    //this.myForm.patchValue({imagen : ''});
    this.imagen = null;
  }

  /**
   * Subir archivo
   */
  subirArchivo(): any {
    try {
      this.loading = true;
      const formularioDeDatos = new FormData();
      /* this.archivos.forEach(archivo => {
        formularioDeDatos.append('files', archivo)
      }) */

      if (this.archivos.length > 0) {
        formularioDeDatos.append('imagen', this.archivos[0]);        
        formularioDeDatos.append('carpeta', 'recibos');      
        formularioDeDatos.append('url_imagen', this.api_serv.getRutaImages());

        Swal.fire({
          title: 'Espere',
          text: 'Subiendo imagen',
          icon: 'info',
          allowOutsideClick: false
        });
        Swal.showLoading();

      }else{
        //alert('Seleccione una imagen');

        Swal.fire({
          title: 'Warning',
          text: 'Seleccione una imagen',
          icon: 'warning'
        });

      }

      var that = this;
      
      this.api_serv.postQueryUpload('imagenes/cliente', formularioDeDatos)
      .subscribe({
        next(data : any) {
          //console.log(data);
          console.log('Respuesta del servidor', data);
          //that.myForm.patchValue({imagen : data.imagen});
          that.imagen = data.imagen;
          //that.uploadForm.get('imagen').setValue(data.imagen);
          that.loading = false;

          Swal.fire({
            title: 'Info',
            text: data.message,
            icon: 'info',
          });
          
        },
        error(msg) {
          console.log(msg);
          that.loading = false;

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
      });

    } catch (e) {
      this.loading = false;
      console.log('ERROR', e);
    }
  }

  pagar(){

    if(this.estado == 'Pagado'){
      Swal.fire({
        title: 'Warning',
        text: 'Su recibo ya está marcado como pagado.',
        icon: 'warning'
      });

      return;
    }
    else if(this.estado == 'Por Aprobar'){
      Swal.fire({
        title: 'Warning',
        text: 'Su recibo está en proceso de verificación.',
        icon: 'warning'
      });

      return;
    }
    else if (this.imagen == null || this.imagen == '') {
      Swal.fire({
        title: 'Warning',
        text: 'Para pagar su recibo debe subir el comprobante de pago.',
        icon: 'warning'
      });

      return;
    }
     
    else{

      Swal.fire({
        title: 'Espere',
        text: 'Ejecutando',
        icon: 'info',
        allowOutsideClick: false
      });
      Swal.showLoading();

      var datos = {
        imagen : this.imagen,
        estado : 1,
        metodo : 'Transferencia'
      };
  
      var that = this;
  
      this.api_serv.putQuery(`recibos/${ this.recibo_id }/pagar/cliente`,datos)
      .subscribe({
        next(data : any) {
          console.log(data);

          that.estado = 'Por Aprobar';
          that.fecha_pago = data.recibo.fecha_pago;
          that.metodo = 'Transferencia';
          
          Swal.fire({
            title: 'Info',
            text: data.message,
            icon: 'info',
          });
  
        },
        error(msg) {
          console.log(msg);
  
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
      });

    }
  }

  pagarPayPal(){

    if(this.estado == 'Pagado'){
      Swal.fire({
        title: 'Warning',
        text: 'Su recibo ya está marcado como pagado.',
        icon: 'warning'
      });

      return;
    }
    else if(this.estado == 'Por Aprobar'){
      Swal.fire({
        title: 'Warning',
        text: 'Su recibo está en proceso de verificación.',
        icon: 'warning'
      });

      return;
    }
     
    else{

      Swal.fire({
        title: 'Espere',
        text: 'Ejecutando',
        icon: 'info',
        allowOutsideClick: false
      });
      Swal.showLoading();

      var datos = {
        imagen : null,
        estado : 2,
        metodo : 'PayPal'
      };
  
      var that = this;
  
      this.api_serv.putQuery(`recibos/${ this.recibo_id }/pagar/cliente`,datos)
      .subscribe({
        next(data : any) {
          console.log(data);

          that.estado = 'Pagado';
          that.fecha_pago = data.recibo.fecha_pago;
          that.metodo = 'PayPal';
          that.imagen = null;

          that.previsualizacion = '';
          
          Swal.fire({
            title: 'Info',
            text: data.message,
            icon: 'info',
          });
  
        },
        error(msg) {
          console.log(msg);
  
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
      });

    }
  }

}
