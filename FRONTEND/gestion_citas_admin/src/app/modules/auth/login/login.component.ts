import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // 👈 Importar CommonModule
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  standalone: true,
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],

  // 👇 IMPORTANTE: Añade aquí los módulos que necesitas.
  imports: [
    CommonModule, // Para directivas como *ngIf, *ngFor, etc.
    ReactiveFormsModule, // Para usar [formGroup], formControlName, etc.
  ],
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  errorMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]], // Mínimo 6 caracteres
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      const { email, password } = this.loginForm.value;
      this.authService.login(email, password).subscribe(
        (response) => {
          localStorage.setItem('token', response.token);
          this.router.navigate(['/dashboard']);
        },
        (error) => {
          this.errorMessage = 'Credenciales incorrectas';
        }
      );
    }
  }
}
