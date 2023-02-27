import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { ClipboardModule } from 'ngx-clipboard';

import { AdminLayoutRoutes } from './admin-layout.routing';
import { DashboardComponent } from '../../pages/dashboard/dashboard.component';
import { IconsComponent } from '../../pages/icons/icons.component';
import { MapsComponent } from '../../pages/maps/maps.component';
import { UserProfileComponent } from '../../pages/user-profile/user-profile.component';
import { TablesComponent } from '../../pages/tables/tables.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
// import { ToastrModule } from 'ngx-toastr';

import {MatPaginatorModule} from '@angular/material/paginator';

import { CuentasComponent } from '../../pages/cuentas/cuentas.component';
import { ObrasComponent } from '../../pages/obras/obras.component';
import { PartidasComponent } from '../../pages/partidas/partidas.component';
import { MovimientosComponent } from '../../pages/movimientos/movimientos.component';
import { SistemaComponent } from '../../pages/sistema/sistema.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(AdminLayoutRoutes),
    FormsModule,
    HttpClientModule,
    NgbModule,
    ClipboardModule,
    FormsModule,
    ReactiveFormsModule,
    MatPaginatorModule
  ],
  declarations: [
    DashboardComponent,
    UserProfileComponent,
    TablesComponent,
    IconsComponent,
    MapsComponent,

    ObrasComponent,
    PartidasComponent,
    CuentasComponent,
    MovimientosComponent,
    SistemaComponent
  ]
})

export class AdminLayoutModule {}
