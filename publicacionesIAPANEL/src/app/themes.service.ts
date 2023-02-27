import { Injectable } from '@angular/core';
import { DOCUMENT} from '@angular/common'
//import { DomController} from '@ionic/angular'
/*
interface Theme {
  name: string;
  styles: ThemeStyle[];
}
interface ThemeStyle{
  themeVariable: string;
  value: string;
}

@Injectable({
  providedIn: 'root'
})*/
export class ThemesService {

  /*private themes: Theme[]=[];
  private currentTheme: number=0;
  public colors={
    color:'',
    color1:''
  }*/

  constructor(/*private domCtrl: DomController, @Inject(DOCUMENT) private document*/) { 
  }
  /*
  setTheme(value1,value2):void {
    this.domCtrl.write({
      document.documentElement.style.setProperty('--ion-color-secundary', value);
      document.documentElement.style.setProperty('--ion-color-primary', value);
      document.documentElement.style.setProperty('--ion-color-tertiary', value);
    });
  }

  getTheme(){
    return this.colors;
  }*/
}
