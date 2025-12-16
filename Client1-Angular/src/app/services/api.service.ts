import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

// API Response interface matching our backend
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors: string[];
  timestamp: string;
  correlationId?: string;
}

// Authorization interfaces
export interface AuthorizationRequest {
  codigoVendedor: string;
  empleadoRH: string;
  nombre: string;
  territorio: string;
  comision: number;
}

// Authentication interfaces
export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  usuario: {
    id: string;
    username: string;
    nombre: string;
    rol: number;
    activo: boolean;
    email: string;
    apellido: string;
    fechaCreacion: string;
    fechaActualizacion: string;
    ultimoLogin: string;
    vendedorId?: string;
    vendedor?: any;
  };
  token: string;
  expiresAt: string;
}

export interface User {
  id: string;
  username: string;
  nombre: string;
  rol: string;
}
export interface Vendedor {
  codigoVendedor: string;
  nombre: string;
  territorio: string;
  comision: number;
  autorizado: boolean;
  fechaAutorizacion: string;
  empleadoRHAutorizo: string;
}

export interface ValidationResponse {
  isValid: boolean;
  reason: string;
  vendedor: Vendedor | null;
}

// HR interfaces
export interface EmpleadoRH {
  id: string;
  nombre: string;
  cargo: string;
  departamento: string;
  email: string;
  telefono: string;
  activo: boolean;
  fechaCreacion: string;
}

// Product interfaces
export interface Producto {
  id: string;
  nombre: string;
  categoria: string;
  precio: number;
  stock: number;
  stockMinimo: number;
  stockMaximo: number;
  descripcion: string;
  unidadMedida: string;
  estado: boolean;
  fechaCreacion: string;
  fechaActualizacion: string;
}

export interface ProductListResponse {
  products: Producto[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}


@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly baseUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) {
    // Log configuration in development
    if (!environment.production) {
      console.log('API Service initialized with base URL:', this.baseUrl);
    }
  }

  // Authentication Methods
  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<ApiResponse<LoginResponse>>(`${this.baseUrl}/Authentication/login`, credentials)
      .pipe(
        map(response => this.handleApiResponse(response)),
        catchError(this.handleError)
      );
  }

  logout(token: string): Observable<any> {
    return this.http.post<ApiResponse<any>>(`${this.baseUrl}/Authentication/logout`, { token })
      .pipe(
        map(response => this.handleApiResponse(response)),
        catchError(this.handleError)
      );
  }

  validateToken(token: string): Observable<User> {
    return this.http.get<ApiResponse<User>>(`${this.baseUrl}/Authentication/validate?token=${token}`)
      .pipe(
        map(response => this.handleApiResponse(response)),
        catchError(this.handleError)
      );
  }

  // Authorization Component (RF1) Methods
  authorizeVendedor(request: AuthorizationRequest): Observable<Vendedor> {
    return this.http.post<ApiResponse<Vendedor>>(`${this.baseUrl}/Autorizacion/authorize`, request)
      .pipe(
        map(response => this.handleApiResponse(response)),
        catchError(this.handleError)
      );
  }

  validateAuthorization(codigoVendedor: string): Observable<ValidationResponse> {
    return this.http.get<ApiResponse<ValidationResponse>>(`${this.baseUrl}/Autorizacion/validate/${codigoVendedor}`)
      .pipe(
        map(response => this.handleApiResponse(response)),
        catchError(this.handleError)
      );
  }

  getAuthorizedVendedores(): Observable<Vendedor[]> {
    return this.http.get<ApiResponse<Vendedor[]>>(`${this.baseUrl}/Autorizacion/vendedores`)
      .pipe(
        map(response => this.handleApiResponse(response)),
        catchError(this.handleError)
      );
  }

  getVendedorByCode(codigoVendedor: string): Observable<Vendedor> {
    return this.http.get<ApiResponse<Vendedor>>(`${this.baseUrl}/Autorizacion/vendedores/${codigoVendedor}`)
      .pipe(
        map(response => this.handleApiResponse(response)),
        catchError(this.handleError)
      );
  }

  // Products Component (RF2) Methods
  getProducts(page: number = 1, pageSize: number = 50, categoria?: string, activo?: boolean, searchTerm?: string): Observable<ProductListResponse> {
    let params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('pageSize', pageSize.toString());
    if (categoria) params.append('categoria', categoria);
    if (activo !== undefined) params.append('activo', activo.toString());
    if (searchTerm) params.append('searchTerm', searchTerm);

    return this.http.get<ApiResponse<ProductListResponse>>(`${this.baseUrl}/Productos?${params.toString()}`)
      .pipe(
        map(response => this.handleApiResponse(response)),
        catchError(this.handleError)
      );
  }

  getProductById(id: string): Observable<Producto> {
    return this.http.get<ApiResponse<Producto>>(`${this.baseUrl}/Productos/${id}`)
      .pipe(
        map(response => this.handleApiResponse(response)),
        catchError(this.handleError)
      );
  }

  createProduct(product: Partial<Producto>): Observable<Producto> {
    // Transform frontend model to backend request format
    const createRequest = {
      nombre: product.nombre,
      descripcion: product.descripcion || '',
      precio: product.precio,
      categoria: product.categoria,
      stock: product.stock || 0,
      stockMinimo: product.stockMinimo || 10,
      stockMaximo: product.stockMaximo || 1000,
      unidadMedida: product.unidadMedida || 'Unidad'
    };

    return this.http.post<ApiResponse<Producto>>(`${this.baseUrl}/Productos`, createRequest)
      .pipe(
        map(response => this.handleApiResponse(response)),
        catchError(this.handleError)
      );
  }

  updateProduct(id: string, product: Partial<Producto>): Observable<Producto> {
    // Transform frontend model to backend request format
    const updateRequest = {
      nombre: product.nombre,
      descripcion: product.descripcion || '',
      precio: product.precio,
      categoria: product.categoria,
      stock: product.stock || 0,
      stockMinimo: product.stockMinimo || 10,
      stockMaximo: product.stockMaximo || 1000,
      unidadMedida: product.unidadMedida || 'Unidad'
    };

    return this.http.put<ApiResponse<Producto>>(`${this.baseUrl}/Productos/${id}`, updateRequest)
      .pipe(
        map(response => this.handleApiResponse(response)),
        catchError(this.handleError)
      );
  }

  deleteProduct(id: string): Observable<boolean> {
    return this.http.delete<ApiResponse<boolean>>(`${this.baseUrl}/Productos/${id}`)
      .pipe(
        map(response => this.handleApiResponse(response)),
        catchError(this.handleError)
      );
  }

  // Helper methods
  private handleApiResponse<T>(response: ApiResponse<T>): T {
    if (response.success) {
      return response.data;
    } else {
      throw new Error(response.message || 'API request failed');
    }
  }

  private handleError = (error: HttpErrorResponse): Observable<never> => {
    let errorMessage = 'An error occurred';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      if (error.error && error.error.message) {
        errorMessage = error.error.message;
      } else if (error.error && error.error.errors && error.error.errors.length > 0) {
        errorMessage = error.error.errors.join(', ');
      } else {
        errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
      }
    }
    
    console.error('API Error:', errorMessage);
    return throwError(() => new Error(errorMessage));
  };
}
