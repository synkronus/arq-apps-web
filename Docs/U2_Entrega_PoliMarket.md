# 📋 Actividad Sumativa - Unidad 2

## Backend con Servicios RESTful CRUD sobre Base de Datos

> **Módulo:** Arquitectura de Aplicaciones Web
> **Repositorio:** https://github.com/synkronus/arq-apps-web.git

---

## 📌 Información del Proyecto

| Campo                               | Valor                                                                |
| ----------------------------------- | -------------------------------------------------------------------- |
| **Framework Backend**         | .NET 8 (ASP.NET Core Web API)                                        |
| **ORM**                       | Entity Framework Core                                                |
| **Base de Datos**             | SQLite (local)                                                       |
| **Cliente HTTP para Pruebas** | Swagger UI (OpenAPI)                                                 |
| **Repositorio GitHub**        | [synkronus/arq-apps-web](https://github.com/synkronus/arq-apps-web.git) |

---

## ✅ Indicadores de Logro Cumplidos

> *"Construye una aplicación web con la implementación de API REST para facilitar el intercambio de información de forma segura."*

### Evidencias de Cumplimiento:

| Requisito                | Estado | Implementación                                     |
| ------------------------ | ------ | --------------------------------------------------- |
| Clase/Entidad Producto   | ✅     | `Backend/PoliMarket.Models/Entities/Inventory.cs` |
| Atributo `id`          | ✅     | `public string Id { get; set; }`                  |
| Atributo `nombre`      | ✅     | `public string Nombre { get; set; }`              |
| Atributo `descripcion` | ✅     | `public string Descripcion { get; set; }`         |
| Atributo `precio`      | ✅     | `public double Precio { get; set; }`              |
| Endpoints CRUD           | ✅     | `ProductosController.cs`                          |
| ORM Implementado         | ✅     | Entity Framework Core con SQLite                    |
| Manejo de Errores        | ✅     | `ApiResponse<T>` con mensajes consistentes        |
| Repositorio GitHub       | ✅     | https://github.com/synkronus/arq-apps-web.git       |

---

## 🏗️ Arquitectura de la Solución

### Estructura del Proyecto

```
RestApi/
├── Backend/
│   ├── PoliMarket.API/                    # Capa de presentación (Controllers)
│   │   ├── Controllers/
│   │   │   ├── AuthenticationController.cs
│   │   │   ├── AutorizacionController.cs
│   │   │   └── ProductosController.cs     # ⭐ CRUD de Productos
│   │   └── Program.cs                     # Configuración DI y Middleware
│   │
│   ├── PoliMarket.Contracts/              # Interfaces (Contratos)
│   │   └── IAutorizacionComponent.cs
│   │
│   ├── PoliMarket.Models/                 # Entidades y DTOs
│   │   ├── Entities/
│   │   │   ├── Inventory.cs               # ⭐ Clase Producto
│   │   │   ├── Users.cs
│   │   │   └── HumanResources.cs
│   │   └── Common/
│   │       └── ApiResponse.cs             # Respuestas estandarizadas
│   │
│   ├── PoliMarket.Components.Products/    # Lógica de negocio
│   │   ├── IProductosComponent.cs
│   │   └── ProductosComponent.cs          # ⭐ Implementación CRUD
│   │
│   ├── PoliMarket.Components.Infrastructure/
│   │   └── Data/
│   │       ├── PoliMarketDbContext.cs     # DbContext EF Core
│   │       └── DatabaseSeeder.cs          # Datos iniciales
│   │
│   └── PoliMarket.sln                     # Solución .NET
│
└── Client1-Angular/                       # Cliente Frontend (opcional)
    └── src/app/
```

### Principios de Arquitectura Aplicados

| Principio                                  | Implementación                                    |
| ------------------------------------------ | -------------------------------------------------- |
| **Separación de Responsabilidades** | Capas: API → Components → Infrastructure         |
| **Inyección de Dependencias**       | Registro en `Program.cs` con `AddScoped<>`     |
| **Patrón Repository**               | `IAutorizacionRepository` abstrae acceso a datos |
| **Diseño por Contratos**            | Interfaces en `PoliMarket.Contracts`             |

---

## 📦 Entidad Producto

### Ubicación: `Backend/PoliMarket.Models/Entities/Inventory.cs`

```csharp
public class Producto : BaseAuditEntity
{
    [Key]
    public string Id { get; set; } = string.Empty;
  
    [Required]
    [MaxLength(200)]
    public string Nombre { get; set; } = string.Empty;
  
    [MaxLength(1000)]
    public string Descripcion { get; set; } = string.Empty;
  
    [Required]
    public double Precio { get; set; }
  
    // Atributos adicionales para gestión de inventario
    public string Categoria { get; set; } = string.Empty;
    public int Stock { get; set; }
    public int StockMinimo { get; set; }
    public int StockMaximo { get; set; }
    public string UnidadMedida { get; set; } = "Unidad";
    public bool Estado { get; set; } = true;
}
```

### Atributos Requeridos vs Implementados

| Requerido       | Implementado      | Tipo       | Descripción                         |
| --------------- | ----------------- | ---------- | ------------------------------------ |
| `id`          | ✅`Id`          | `string` | Identificador único (auto-generado) |
| `nombre`      | ✅`Nombre`      | `string` | Nombre del producto                  |
| `descripcion` | ✅`Descripcion` | `string` | Descripción breve                   |
| `precio`      | ✅`Precio`      | `double` | Valor numérico del precio           |

---

## 🔌 Endpoints RESTful Implementados

### Base URL: `http://localhost:5001/api/Productos`

| Método    | Endpoint                | Operación CRUD  | Descripción                           |
| ---------- | ----------------------- | ---------------- | -------------------------------------- |
| `GET`    | `/api/Productos`      | **Read**   | Obtener todos los productos (paginado) |
| `GET`    | `/api/Productos/{id}` | **Read**   | Obtener producto por ID                |
| `POST`   | `/api/Productos`      | **Create** | Crear nuevo producto                   |
| `PUT`    | `/api/Productos/{id}` | **Update** | Actualizar producto existente          |
| `DELETE` | `/api/Productos/{id}` | **Delete** | Eliminar producto (soft delete)        |

### Endpoints Adicionales

| Método   | Endpoint                      | Descripción                    |
| --------- | ----------------------------- | ------------------------------- |
| `GET`   | `/api/Productos/categories` | Obtener categorías disponibles |
| `PATCH` | `/api/Productos/{id}/price` | Actualizar solo el precio       |
| `GET`   | `/api/Productos/low-stock`  | Productos con stock bajo        |

---

## 🗄️ ORM - Entity Framework Core

### Configuración del DbContext

**Ubicación:** `Backend/PoliMarket.Components.Infrastructure/Data/PoliMarketDbContext.cs`

```csharp
public class PoliMarketDbContext : DbContext
{
    public DbSet<Producto> Productos { get; set; }
    public DbSet<Usuario> Usuarios { get; set; }
    public DbSet<Vendedor> Vendedores { get; set; }
    public DbSet<EmpleadoRH> EmpleadosRH { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Configuración de entidades con Fluent API
        modelBuilder.Entity<Producto>()
            .HasKey(p => p.Id);

        modelBuilder.Entity<Producto>()
            .Property(p => p.Nombre)
            .IsRequired()
            .HasMaxLength(200);
    }
}
```

### Registro en Program.cs

```csharp
// Configuración de Entity Framework con SQLite
builder.Services.AddDbContext<PoliMarketDbContext>(options =>
    options.UseSqlite(connectionString));
```

### Operaciones CRUD con EF Core

```csharp
// CREATE
_context.Productos.Add(producto);
await _context.SaveChangesAsync();

// READ
var productos = await _context.Productos.ToListAsync();
var producto = await _context.Productos.FindAsync(id);

// UPDATE
existingProduct.Nombre = producto.Nombre;
await _context.SaveChangesAsync();

// DELETE (Soft Delete)
producto.Estado = false;
await _context.SaveChangesAsync();
```

---

## ⚠️ Manejo de Errores

### Estructura de Respuesta Estandarizada

**Ubicación:** `Backend/PoliMarket.Models/Common/ApiResponse.cs`

```csharp
public class ApiResponse<T>
{
    public bool Success { get; set; }
    public string Message { get; set; }
    public T Data { get; set; }
    public List<string> Errors { get; set; }
    public DateTime Timestamp { get; set; }

    public static ApiResponse<T> SuccessResult(T data, string message = "")
        => new() { Success = true, Data = data, Message = message };

    public static ApiResponse<T> ErrorResult(string message, string error = null)
        => new() { Success = false, Message = message, Errors = new List<string> { error } };
}
```

### Ejemplo de Manejo de Errores en Componente

```csharp
public async Task<ApiResponse<Producto>> GetProductByIdAsync(string productoId)
{
    try
    {
        var producto = await _context.Productos.FindAsync(productoId);

        if (producto == null)
        {
            return ApiResponse<Producto>.ErrorResult("Producto no encontrado");
        }

        return ApiResponse<Producto>.SuccessResult(producto, "Producto encontrado");
    }
    catch (Exception ex)
    {
        _logger.LogError(ex, "Error getting product: {ProductId}", productoId);
        return ApiResponse<Producto>.ErrorResult("Error interno del servidor", ex.Message);
    }
}
```

---

## 🧪 Pruebas con Swagger

### Acceso a Swagger UI

**URL:** `http://localhost:5001/swagger`

### Capturas de Pantalla de Pruebas

#### 1. GET - Listar Productos

```
GET /api/Productos?page=1&pageSize=10

Response 200 OK:
{
  "success": true,
  "message": "Se encontraron 10 productos",
  "data": {
    "products": [...],
    "totalCount": 10,
    "page": 1,
    "pageSize": 10,
    "totalPages": 1
  }
}
```

#### 2. POST - Crear Producto

```
POST /api/Productos

Request Body:
{
  "nombre": "Nuevo Producto",
  "descripcion": "Descripción del producto",
  "precio": 15000,
  "categoria": "Electrónica",
  "stock": 50,
  "stockMinimo": 10,
  "stockMaximo": 200
}

Response 201 Created:
{
  "success": true,
  "message": "Producto creado exitosamente",
  "data": {
    "id": "PROD20241217123456789",
    "nombre": "Nuevo Producto",
    ...
  }
}
```

#### 3. PUT - Actualizar Producto

```
PUT /api/Productos/P001

Request Body:
{
  "nombre": "Producto Actualizado",
  "precio": 18000,
  ...
}

Response 200 OK:
{
  "success": true,
  "message": "Producto actualizado exitosamente"
}
```

#### 4. DELETE - Eliminar Producto

```
DELETE /api/Productos/P001

Response 200 OK:
{
  "success": true,
  "message": "Producto eliminado exitosamente"
}
```

---

## 📂 Repositorio GitHub

### URL del Repositorio

🔗 **https://github.com/synkronus/arq-apps-web.git**

### Comandos para Subir el Código

```bash
# Inicializar repositorio
git init

# Agregar archivos
git add .

# Crear commit
git commit -m "feat: Backend REST API con CRUD de Productos"

# Conectar con repositorio remoto
git remote add origin https://github.com/synkronus/arq-apps-web.git

# Subir cambios
git push -u origin main
```

### Estructura del Repositorio

```
arq-apps-web/
├── Backend/                    # Código fuente del API
├── Client1-Angular/            # Cliente Angular (adicional)
├── Docs/                       # Documentación
│   ├── U2_Entrega_PoliMarket.md
│   └── Video-Presentacion/
├── .gitignore                  # Archivos ignorados
└── README.md                   # Documentación principal
```

---

## 🎥 Contenido del Video (15 min máx)

| Tiempo        | Sección          | Contenido                                 |
| ------------- | ----------------- | ----------------------------------------- |
| 0:00 - 2:00   | Introducción     | Presentación del proyecto y arquitectura |
| 2:00 - 6:00   | Backend           | Mostrar estructura, entidad Producto, ORM |
| 6:00 - 10:00  | Pruebas Swagger   | CRUD completo (GET, POST, PUT, DELETE)    |
| 10:00 - 12:00 | Manejo de Errores | Demostrar respuestas de error             |
| 12:00 - 14:00 | GitHub            | Comandos git y repositorio                |
| 14:00 - 15:00 | Cierre            | Resumen y URL del repositorio             |

---


## 🚀 Instrucciones para Ejecutar

```bash
# 1. Clonar repositorio
git clone https://github.com/synkronus/arq-apps-web.git
cd arq-apps-web

# 2. Restaurar dependencias
cd Backend/PoliMarket.API
dotnet restore

# 3. Ejecutar aplicación
dotnet run

# 4. Abrir Swagger
# Navegar a: http://localhost:5001/swagger
```

---

*Fecha de entrega: Diciembre 2024*
