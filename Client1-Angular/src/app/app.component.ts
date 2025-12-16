import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'PoliMarket - Product Management';

  constructor(
    private router: Router,
    private messageService: MessageService
  ) {}

  isLoggedIn(): boolean {
    // Check if user is logged in (simplified for demo)
    return localStorage.getItem('currentUser') !== null;
  }

  logout() {
    localStorage.removeItem('currentUser');
    this.messageService.add({
      severity: 'info',
      summary: 'Sesión Cerrada',
      detail: 'Ha cerrado sesión exitosamente'
    });
    this.router.navigate(['/login']);
  }
}