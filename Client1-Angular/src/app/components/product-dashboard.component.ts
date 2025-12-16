import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ApiService, ProductListResponse} from '../services/api.service';

interface Product {
  id: string;
  nombre: string;
  categoria: string;
  precio: number;
  stockActual: number;
  stockMinimo: number;
  stockMaximo: number;
  proveedor: string;
  fechaActualizacion: Date;
  activo: boolean;
  descripcion?: string;
  unidadMedida?: string;
}


@Component({
  selector: 'app-product-dashboard',
  templateUrl: './product-dashboard.component.html',
  styleUrls: ['./product-dashboard.component.scss']
})
export class ProductDashboardComponent implements OnInit {
  // Data
  products: Product[] = [];
  filteredProducts: Product[] = [];

  // Filters (removed as requested)

  // UI State
  showAddProduct: boolean = false;
  newProduct: any = {};

  constructor(
    private apiService: ApiService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private router: Router
  ) {}

  ngOnInit() {
    // Check if user is logged in
    if (!localStorage.getItem('currentUser')) {
      this.router.navigate(['/login']);
      return;
    }
    
    this.loadRealData();
    this.initializeFilters();
  }

  initializeFilters() {
    // Filters removed as requested
    console.log('Filters removed - showing all products');
  }

  loadRealData() {
    console.log('Loading real product data from API...');

    // Load products from API
    this.apiService.getProducts(1, 100, undefined, true).subscribe({
      next: (response: ProductListResponse) => {
        console.log('API Response:', response);

        // Convert API products to component format
        this.products = response.products.map(producto => ({
          id: producto.id,
          nombre: producto.nombre,
          categoria: producto.categoria,
          precio: producto.precio,
          stockActual: producto.stock,
          stockMinimo: producto.stockMinimo,
          stockMaximo: producto.stockMaximo,
          proveedor: 'API Provider', // Default since API doesn't have provider field
          fechaActualizacion: new Date(producto.fechaActualizacion || producto.fechaCreacion),
          activo: producto.estado
        }));

        console.log('Converted products:', this.products);

        // Generate mock data for other components since they don't have API endpoints yet
        this.generateMockSupportingData();

        // Apply filters after data is loaded
        this.filterProducts();
        this.initializeFilters(); // Re-initialize filters after data loads
      },
      error: (error) => {
        console.error('Error loading products from API:', error);
        console.log('Falling back to mock data...');
        this.loadMockData();
        this.initializeFilters(); // Initialize filters after fallback data loads
      }
    });
  }

  generateMockSupportingData() {
    // Generate stock alerts based on real product data
  }

  // Filter methods removed as requested

  getSupplierOptions() {
    const suppliers = [...new Set(this.products.map(p => p.proveedor))];
    return [{label: 'Todos los proveedores', value: ''}].concat(
      suppliers.map(s => ({label: s, value: s}))
    );
  }

  filterProducts() {
    // Show all products - filters removed as requested
    this.filteredProducts = this.products;
  }

  getTotalInventoryValue(): number {
    return this.products.reduce((total, product) => total + (product.precio * product.stockActual), 0);
  }

  addProduct() {
    if (this.newProduct.nombre && this.newProduct.categoria && this.newProduct.precio) {
      const productData = {
        nombre: this.newProduct.nombre,
        categoria: this.newProduct.categoria,
        precio: this.newProduct.precio,
        stock: this.newProduct.stockActual || 0,
        stockMinimo: this.newProduct.stockMinimo || 5,
        stockMaximo: this.newProduct.stockMaximo || 100,
        descripcion: this.newProduct.descripcion || '',
        unidadMedida: this.newProduct.unidadMedida || 'Unidad'
      };
      
      this.apiService.createProduct(productData).subscribe({
        next: (result) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Producto Creado',
            detail: `Producto ${result.nombre} creado exitosamente`
          });
          this.loadRealData();
          this.showAddProduct = false;
          this.newProduct = {};
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: error.message || 'Error al crear producto'
          });
        }
      });
    }
  }

  editProduct(product: Product) {
    this.newProduct = { ...product };
    this.showAddProduct = true;
  }

  updateProduct() {
    if (!this.newProduct.id || !this.newProduct.nombre || !this.newProduct.precio) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Campos Requeridos',
        detail: 'Por favor complete los campos obligatorios'
      });
      return;
    }

    const productData = {
      nombre: this.newProduct.nombre,
      categoria: this.newProduct.categoria,
      precio: this.newProduct.precio,
      stock: this.newProduct.stockActual || 0,
      stockMinimo: this.newProduct.stockMinimo || 5,
      stockMaximo: this.newProduct.stockMaximo || 100,
      descripcion: this.newProduct.descripcion || '',
      unidadMedida: this.newProduct.unidadMedida || 'Unidad'
    };

    this.apiService.updateProduct(this.newProduct.id, productData).subscribe({
      next: (result) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Producto Actualizado',
          detail: `Producto ${result.nombre} actualizado exitosamente`
        });
        this.loadRealData();
        this.showAddProduct = false;
        this.newProduct = {};
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error.message || 'Error al actualizar producto'
        });
      }
    });
  }

  deleteProduct(product: Product) {
    this.confirmationService.confirm({
      message: `¿Está seguro de que desea eliminar el producto ${product.nombre}?`,
      header: 'Confirmar Eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, Eliminar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.apiService.deleteProduct(product.id).subscribe({
          next: (result) => {
            this.messageService.add({
              severity: 'success',
              summary: 'Producto Eliminado',
              detail: `Producto ${product.nombre} eliminado exitosamente`
            });
            this.loadRealData();
          },
          error: (error) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: error.message || 'Error al eliminar producto'
            });
          }
        });
      }
    });
  }


  // Fallback method for when API is not available
  loadMockData() {
    console.log('Loading mock data as fallback...');

    // Mock Products
    this.products = [
      {
        id: 'P001',
        nombre: 'Laptop Dell Inspiron 15',
        categoria: 'Electrónicos',
        precio: 2500000,
        stockActual: 15,
        stockMinimo: 5,
        stockMaximo: 50,
        proveedor: 'TechSupply Colombia',
        fechaActualizacion: new Date(),
        activo: true
      },
      {
        id: 'P002',
        nombre: 'Mouse Logitech MX Master',
        categoria: 'Accesorios',
        precio: 350000,
        stockActual: 3,
        stockMinimo: 10,
        stockMaximo: 100,
        proveedor: 'TechSupply Colombia',
        fechaActualizacion: new Date(),
        activo: true
      },
      {
        id: 'P003',
        nombre: 'Monitor Samsung 24"',
        categoria: 'Electrónicos',
        precio: 800000,
        stockActual: 0,
        stockMinimo: 3,
        stockMaximo: 20,
        proveedor: 'Distribuidora Valle',
        fechaActualizacion: new Date(),
        activo: true
      },
      {
        id: 'P004',
        nombre: 'Teclado Mecánico RGB',
        categoria: 'Accesorios',
        precio: 450000,
        stockActual: 12,
        stockMinimo: 8,
        stockMaximo: 40,
        proveedor: 'TechSupply Colombia',
        fechaActualizacion: new Date(),
        activo: true
      }
    ];

    // Apply filters
    this.filterProducts();
  }
}
