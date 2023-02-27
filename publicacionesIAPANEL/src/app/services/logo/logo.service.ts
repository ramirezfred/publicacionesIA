import { Injectable, EventEmitter } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LogoService {

  logo_negocio$ = new EventEmitter<string>();

  constructor() { }
}
