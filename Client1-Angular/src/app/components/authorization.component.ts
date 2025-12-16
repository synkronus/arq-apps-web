import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ApiService, LoginRequest, LoginResponse } from '../services/api.service';

@Component({
  selector: 'app-authorization',
  templateUrl: './authorization.component.html',
  styleUrls: ['./authorization.component.scss']
})
export class AuthorizationComponent implements OnInit {
  username: string = '';
  password: string = '';
  isLoading: boolean = false;

  constructor(
    private apiService: ApiService,
    private messageService: MessageService,
    private router: Router
  ) {}

  ngOnInit() {
    // Check if already logged in
    if (localStorage.getItem('currentUser')) {
      this.router.navigate(['/products']);
    }
  }

  login() {
    if (!this.username || !this.password) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Campos Requeridos',
        detail: 'Por favor ingrese usuario y contraseña'
      });
      return;
    }

    this.isLoading = true;

    // Real authentication API call
    const loginRequest: LoginRequest = {
      username: this.username,
      password: this.password
    };

    this.apiService.login(loginRequest).subscribe({
      next: (response: LoginResponse) => {
        // Store user info and token
        localStorage.setItem('currentUser', JSON.stringify(response.usuario));
        localStorage.setItem('authToken', response.token);
        
        this.messageService.add({
          severity: 'success',
          summary: 'Login Exitoso',
          detail: `Bienvenido ${response.usuario.nombre}`
        });
        
        this.router.navigate(['/products']);
        this.isLoading = false;
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error de Autenticación',
          detail: error.message || 'Usuario o contraseña incorrectos'
        });
        
        this.isLoading = false;
      }
    });
  }
}