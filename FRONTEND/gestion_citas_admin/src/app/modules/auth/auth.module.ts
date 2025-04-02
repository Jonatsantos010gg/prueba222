import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms'; // 👈 Importar esto
import { LoginComponent } from './login/login.component';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    LoginComponent, // 👈 Esto es lo que faltaba
  ],
})
export class AuthModule {}
