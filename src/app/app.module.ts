import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { OrganizationCellComponent } from './organization-cell/organization-cell.component';

@NgModule({
  declarations: [
    AppComponent,
    OrganizationCellComponent,
  ],
  imports: [
    BrowserModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
