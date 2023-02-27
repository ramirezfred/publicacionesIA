import { Routes } from '@angular/router';

import { DashboardComponent } from '../../pages/dashboard/dashboard.component';
import { IconsComponent } from '../../pages/icons/icons.component';
import { MapsComponent } from '../../pages/maps/maps.component';
import { UserProfileComponent } from '../../pages/user-profile/user-profile.component';
import { TablesComponent } from '../../pages/tables/tables.component';

import { CuentasComponent } from '../../pages/cuentas/cuentas.component';
import { ObrasComponent } from '../../pages/obras/obras.component';
import { PartidasComponent } from '../../pages/partidas/partidas.component';
import { MovimientosComponent } from '../../pages/movimientos/movimientos.component';
import { SistemaComponent } from '../../pages/sistema/sistema.component';

import { AuthGuard } from '../../guards/auth.guard';
import { AdminGuard } from '../../guards/admin.guard';
import { NegocioGuard } from '../../guards/negocio.guard';

export const AdminLayoutRoutes: Routes = [
    { path: 'dashboard',      component: DashboardComponent, canActivate: [ AuthGuard ] },
    { path: 'user-profile',   component: UserProfileComponent },
    { path: 'tables',         component: TablesComponent },
    { path: 'icons',          component: IconsComponent },
    { path: 'maps',           component: MapsComponent },

    { path: 'cuentas',           component: CuentasComponent, canActivate: [ AuthGuard ] },
    { path: 'obras',           component: ObrasComponent, canActivate: [ AuthGuard ] },
    { path: 'partidas',           component: PartidasComponent, canActivate: [ AuthGuard ] },
    { path: 'movimientos',           component: MovimientosComponent, canActivate: [ AuthGuard ] },
    { path: 'sistema',           component: SistemaComponent, canActivate: [ AuthGuard ] },
];
