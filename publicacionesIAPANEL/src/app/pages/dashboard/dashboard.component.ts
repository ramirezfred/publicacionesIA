import { Component, OnInit, AfterViewInit, ElementRef, ViewChild, Renderer2 } from '@angular/core';
import Chart from 'chart.js';
//import { ThemesService } from '../../themes.service';
import { APIService } from '../../services/API/API.service';
import Swal from 'sweetalert2';

import { HttpClient, HttpHeaders } from '@angular/common/http';
import { SesionService } from '../../services/sesion/sesion.service';

// core components
import {
  chartOptions,
  parseOptions,
  chartExample1,
  chartExample2
} from "../../variables/charts";

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit,  AfterViewInit {

  public datasets: any;
  public data: any;
  public salesChart;
  public clicked: boolean = true;
  public clicked1: boolean = false;

  public themes: any='bg-gradient-danger';

  //Gradiente
  @ViewChild('gradiente') grad: ElementRef;
  color_a = "#f5365c";
  color_b = "#f56036";

  cuentas = null;
  obras = null;
  partidas = null;
  movimientos = null;

  constructor(private renderer2: Renderer2,
              private sesion_serv: SesionService,
              private api_serv: APIService,
              private http: HttpClient,
    ) {

      this.color_a = this.sesion_serv.getColorA();
      this.color_b = this.sesion_serv.getColorB();

     }

  ngOnInit() {

    // this.datasets = [
    //   [0, 20, 10, 30, 15, 40, 20, 60, 60],
    //   [0, 20, 5, 25, 10, 30, 15, 40, 40]
    // ];
    // this.data = this.datasets[0];


    // var chartOrders = document.getElementById('chart-orders');

    // parseOptions(Chart, chartOptions());


    // var ordersChart = new Chart(chartOrders, {
    //   type: 'bar',
    //   options: chartExample2.options,
    //   data: chartExample2.data
    // });

    // var chartSales = document.getElementById('chart-sales');

    // this.salesChart = new Chart(chartSales, {
		// 	type: 'line',
		// 	options: chartExample1.options,
		// 	data: chartExample1.data
		// });

    this.getContadores();
  }

  ngAfterViewInit() {
    this.setGradiente(this.color_a, this.color_b);
  }

  setGradiente(Color_a : string = this.color_a, Color_b : string = this.color_b) : void {
    //style="background: linear-gradient(87deg, {{color_a}} 0, {{color_b}} 100%) !important;"
    const Gradiente = this.grad.nativeElement;
    //console.log(Gradiente);
    this.renderer2.setStyle(Gradiente, 'background', `linear-gradient(87deg, ${ Color_a } 0, ${ Color_b } 100%)`);
  }


  public updateOptions() {
    this.salesChart.data.datasets[0].data = this.data;
    this.salesChart.update();
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

  getContadores() {

    this.cuentas = 'Consultando...';
    this.obras = 'Consultando...';
    this.partidas = 'Consultando...';
    this.movimientos = 'Consultando...';

    var that = this;

    this.api_serv.getQuery(`dashboard/contadores`)
    .subscribe({
      next(data : any) {
        console.log(data);
        that.cuentas = data.cuentas;
        that.obras = data.obras;
        that.partidas = data.partidas;
        that.movimientos = data.movimientos;
      },
      error(msg) {
        console.log(msg);

        that.tratarError(msg);

      }
    });
  }

}
