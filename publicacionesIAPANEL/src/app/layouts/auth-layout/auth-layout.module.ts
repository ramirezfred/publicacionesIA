import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AuthLayoutRoutes } from './auth-layout.routing';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { LoginComponent } from '../../pages/login/login.component';
import { RegisterComponent } from '../../pages/register/register.component';
import { PagarReciboComponent } from '../../pages/pagar-recibo/pagar-recibo.component';
@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(AuthLayoutRoutes),
    FormsModule,
    // NgbModule
    ReactiveFormsModule
  ],
  declarations: [
    LoginComponent,
    RegisterComponent,
    PagarReciboComponent
  ]
})
export class AuthLayoutModule { }
