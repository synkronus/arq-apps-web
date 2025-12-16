using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using PoliMarket.Models.Entities;
using BCrypt.Net;

namespace PoliMarket.Components.Infrastructure.Data;

/// <summary>
/// Database seeder for PoliMarket system
/// Seeds realistic test data for complete business workflow
/// </summary>
public class DatabaseSeeder
{
    private readonly PoliMarketDbContext _context;
    private readonly ILogger<DatabaseSeeder> _logger;

    public DatabaseSeeder(PoliMarketDbContext context, ILogger<DatabaseSeeder> logger)
    {
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Seeds the database with comprehensive test data
    /// Always runs on startup and seeds missing components (production-safe)
    /// </summary>
    public async Task SeedAsync()
    {
        try
        {
            _logger.LogInformation("Starting database seeding...");

            // Always check and seed missing components individually
            // This ensures the system can start even if some components are missing

            // Seed core entities first (no dependencies)
            await SafeSeedAsync("HR Employees", SeedHREmployeesAsync);
            await SafeSeedAsync("Sellers", SeedSellersAsync);
            await SafeSeedAsync("Users", SeedUsersAsync);
            await SafeSeedAsync("Products", SeedProductsAsync);

            // Save changes after core entities to ensure foreign keys exist
            await _context.SaveChangesAsync();
            _logger.LogInformation("Core entities seeded successfully");

            // Verify critical components are present
            await VerifySeededDataAsync();

            _logger.LogInformation("Database seeding completed successfully");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during database seeding");
            // Don't throw - allow the application to start even if seeding fails
            _logger.LogWarning("Application will continue without complete seed data");
        }
    }

    /// <summary>
    /// Verifies that critical seed data is present after seeding
    /// </summary>
    private async Task VerifySeededDataAsync()
    {
        try
        {
            var hrCount = await _context.EmpleadosRH.CountAsync();
            var sellerCount = await _context.Vendedores.CountAsync();
            var authorizedSellerCount = await _context.Vendedores.CountAsync(v => v.Autorizado);
            var productCount = await _context.Productos.CountAsync();
            var userCount = await _context.Usuarios.CountAsync();
            var hasDemoSeller = await _context.Vendedores.AnyAsync(v => v.CodigoVendedor == "DEMO");

            _logger.LogInformation($"Seed data verification: HR={hrCount}, Sellers={sellerCount}, Authorized={authorizedSellerCount}, Products={productCount}, Users={userCount}, Demo={hasDemoSeller}");

            // Log warnings for missing critical data
            if (hrCount == 0) _logger.LogWarning("No HR employees found - authorization may not work");
            if (authorizedSellerCount == 0) _logger.LogWarning("No authorized sellers found - authorization may not work");
            if (productCount == 0) _logger.LogWarning("No products found - product management may not work");
            if (!hasDemoSeller) _logger.LogWarning("DEMO seller not found - testing may be difficult");

            // Ensure minimum required data exists
            if (hrCount > 0 && authorizedSellerCount > 0 && productCount > 0 && userCount > 0)
            {
                _logger.LogInformation("✅ Database seeding verification passed - all critical components present");
            }
            else
            {
                _logger.LogWarning("⚠️ Database seeding verification incomplete - some components may be missing");
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Error verifying seeded data");
        }
    }

    /// <summary>
    /// Safely executes a seeding method with error handling
    /// </summary>
    private async Task SafeSeedAsync(string componentName, Func<Task> seedMethod)
    {
        try
        {
            _logger.LogInformation($"Starting to seed {componentName}...");
            await seedMethod();
            _logger.LogInformation($"Successfully seeded {componentName}");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error seeding {componentName}: {ex.Message}");
            // TEMPORARILY: Re-throw to see what's failing
            throw;
        }
    }



    private async Task SeedHREmployeesAsync()
    {
        _logger.LogInformation("Seeding HR employees...");

        // Check if specific HR employee exists (our key indicator for proper seeding)
        if (await _context.EmpleadosRH.AnyAsync(e => e.Id == "HR001"))
        {
            _logger.LogInformation("HR001 employee exists. Skipping HR seeding.");
            return;
        }

        var hrEmployees = new List<EmpleadoRH>
        {
            new EmpleadoRH
            {
                Id = "HR001",
                Nombre = "Ana García Rodríguez",
                Cargo = "Gerente de Recursos Humanos",
                Departamento = "Recursos Humanos",
                Email = "ana.garcia@polimarket.com",
                Telefono = "+57 300 123 4567",
                FechaIngreso = DateTime.UtcNow.AddYears(-3),
                Activo = true
            },
            new EmpleadoRH
            {
                Id = "HR002",
                Nombre = "Carlos López Martínez",
                Cargo = "Analista de Recursos Humanos",
                Departamento = "Recursos Humanos",
                Email = "carlos.lopez@polimarket.com",
                Telefono = "+57 300 234 5678",
                FechaIngreso = DateTime.UtcNow.AddYears(-2),
                Activo = true
            },
            new EmpleadoRH
            {
                Id = "HR003",
                Nombre = "María Elena Vargas",
                Cargo = "Coordinadora de Selección",
                Departamento = "Recursos Humanos",
                Email = "maria.vargas@polimarket.com",
                Telefono = "+57 300 345 6789",
                FechaIngreso = DateTime.UtcNow.AddYears(-1),
                Activo = true
            },
            new EmpleadoRH
            {
                Id = "HR004",
                Nombre = "Jorge Andrés Ruiz",
                Cargo = "Especialista en Capacitación",
                Departamento = "Recursos Humanos",
                Email = "jorge.ruiz@polimarket.com",
                Telefono = "+57 300 456 7890",
                FechaIngreso = DateTime.UtcNow.AddMonths(-8),
                Activo = true
            },
            new EmpleadoRH
            {
                Id = "HR005",
                Nombre = "Laura Patricia Sánchez",
                Cargo = "Asistente de RH",
                Departamento = "Recursos Humanos",
                Email = "laura.sanchez@polimarket.com",
                Telefono = "+57 300 567 8901",
                FechaIngreso = DateTime.UtcNow.AddMonths(-6),
                Activo = true
            }
        };

        await _context.EmpleadosRH.AddRangeAsync(hrEmployees);
        _logger.LogInformation($"Added {hrEmployees.Count} HR employees");
    }

    private async Task SeedSellersAsync()
    {
        _logger.LogInformation("Seeding sellers...");

        // Check if DEMO seller exists (our key indicator for proper seeding)
        if (await _context.Vendedores.AnyAsync(v => v.CodigoVendedor == "DEMO"))
        {
            _logger.LogInformation("DEMO seller exists. Skipping sellers seeding.");
            return;
        }

        var sellers = new List<Vendedor>
        {
            // Authorized Sellers
            new Vendedor
            {
                CodigoVendedor = "V001",
                Nombre = "Juan Carlos Pérez",
                Territorio = "Bogotá Norte",
                Comision = 5.5,
                Autorizado = true,
                FechaAutorizacion = DateTime.UtcNow.AddMonths(-2),
                EmpleadoRHAutorizo = "HR001",
                Activo = true
            },
            new Vendedor
            {
                CodigoVendedor = "V002",
                Nombre = "Sandra Milena Torres",
                Territorio = "Bogotá Sur",
                Comision = 6.0,
                Autorizado = true,
                FechaAutorizacion = DateTime.UtcNow.AddMonths(-2),
                EmpleadoRHAutorizo = "HR001",
                Activo = true
            },
            new Vendedor
            {
                CodigoVendedor = "V003",
                Nombre = "Miguel Ángel Ramírez",
                Territorio = "Medellín Centro",
                Comision = 5.8,
                Autorizado = true,
                FechaAutorizacion = DateTime.UtcNow.AddMonths(-1),
                EmpleadoRHAutorizo = "HR002",
                Activo = true
            },
            new Vendedor
            {
                CodigoVendedor = "V004",
                Nombre = "Diana Carolina Herrera",
                Territorio = "Cali Valle",
                Comision = 6.2,
                Autorizado = true,
                FechaAutorizacion = DateTime.UtcNow.AddMonths(-1),
                EmpleadoRHAutorizo = "HR002",
                Activo = true
            },
            new Vendedor
            {
                CodigoVendedor = "V005",
                Nombre = "Andrés Felipe Morales",
                Territorio = "Barranquilla Atlántico",
                Comision = 5.9,
                Autorizado = true,
                FechaAutorizacion = DateTime.UtcNow.AddDays(-21), // 3 weeks ago
                EmpleadoRHAutorizo = "HR003",
                Activo = true
            },
            // Pending Authorization
            new Vendedor
            {
                CodigoVendedor = "V006",
                Nombre = "Claudia Patricia Jiménez",
                Territorio = "Cartagena Bolívar",
                Comision = 5.7,
                Autorizado = false,
                FechaAutorizacion = DateTime.MinValue,
                EmpleadoRHAutorizo = "",
                Activo = true
            },
            new Vendedor
            {
                CodigoVendedor = "V007",
                Nombre = "Roberto Carlos Mendoza",
                Territorio = "Bucaramanga Santander",
                Comision = 6.1,
                Autorizado = false,
                FechaAutorizacion = DateTime.MinValue,
                EmpleadoRHAutorizo = "",
                Activo = true
            },
            new Vendedor
            {
                CodigoVendedor = "V008",
                Nombre = "Paola Andrea Castillo",
                Territorio = "Pereira Risaralda",
                Comision = 5.6,
                Autorizado = false,
                FechaAutorizacion = DateTime.MinValue,
                EmpleadoRHAutorizo = "",
                Activo = true
            },
            // Demo seller for immediate testing
            new Vendedor
            {
                CodigoVendedor = "DEMO",
                Nombre = "Vendedor Demo",
                Territorio = "Nacional",
                Comision = 5.0,
                Autorizado = true,
                FechaAutorizacion = DateTime.UtcNow,
                EmpleadoRHAutorizo = "HR001",
                Activo = true
            }
        };

        await _context.Vendedores.AddRangeAsync(sellers);
        _logger.LogInformation($"Added {sellers.Count} sellers");
    }

    private async Task SeedUsersAsync()
    {
        _logger.LogInformation("Seeding users...");

        // Check if specific test users already exist (instead of any users)
        var existingTestUsers = await _context.Usuarios
            .Where(u => u.Username == "juan.perez" || u.Username == "sandra.torres" ||
                       u.Username == "ana.garcia" || u.Username == "carlos.lopez")
            .CountAsync();

        if (existingTestUsers >= 4)
        {
            _logger.LogInformation("Test users already exist. Skipping additional users seeding.");
            return;
        }

        var users = new List<Usuario>
        {
            // HR Users
            new Usuario
            {
                Id = Guid.NewGuid().ToString(),
                Username = "ana.garcia",
                Email = "ana.garcia@polimarket.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("password123"),
                Nombre = "Ana García",
                Apellido = "Rodríguez",
                Rol = UserRole.HRManager,
                EmpleadoRHId = "HR001",
                Activo = true
            },
            new Usuario
            {
                Id = Guid.NewGuid().ToString(),
                Username = "carlos.lopez",
                Email = "carlos.lopez@polimarket.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("password123"),
                Nombre = "Carlos López",
                Apellido = "Martínez",
                Rol = UserRole.HRManager,
                EmpleadoRHId = "HR002",
                Activo = true
            },
            // Seller Users (only for authorized sellers)
            new Usuario
            {
                Id = Guid.NewGuid().ToString(),
                Username = "juan.perez",
                Email = "juan.perez@polimarket.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("password123"),
                Nombre = "Juan Carlos",
                Apellido = "Pérez",
                Rol = UserRole.SalesRep,
                VendedorId = "V001",
                Activo = true
            },
            new Usuario
            {
                Id = Guid.NewGuid().ToString(),
                Username = "sandra.torres",
                Email = "sandra.torres@polimarket.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("password123"),
                Nombre = "Sandra Milena",
                Apellido = "Torres",
                Rol = UserRole.SalesRep,
                VendedorId = "V002",
                Activo = true
            }
        };

        await _context.Usuarios.AddRangeAsync(users);
        _logger.LogInformation($"Added {users.Count} users");
    }


    private async Task SeedProductsAsync()
    {
        _logger.LogInformation("Seeding products...");

        // Check if specific product exists (our key indicator for proper seeding)
        if (await _context.Productos.AnyAsync(p => p.Id == "P001"))
        {
            _logger.LogInformation("P001 product exists. Skipping products seeding.");
            return;
        }

        var products = new List<Producto>
        {
            // Alimentos y Bebidas
            new Producto
            {
                Id = "P001",
                Nombre = "Arroz Diana Premium 500g",
                Descripcion = "Arroz blanco de alta calidad, grano largo",
                Precio = 3500,
                Categoria = "Alimentos Básicos",
                Stock = 150,
                StockMinimo = 20,
                StockMaximo = 500,
                UnidadMedida = "Paquete",
                Estado = true
            },
            new Producto
            {
                Id = "P002",
                Nombre = "Aceite Girasol 1L",
                Descripcion = "Aceite de girasol refinado para cocina",
                Precio = 8900,
                Categoria = "Alimentos Básicos",
                Stock = 80,
                StockMinimo = 15,
                StockMaximo = 200,
                UnidadMedida = "Botella",
                Estado = true
            },
            new Producto
            {
                Id = "P003",
                Nombre = "Leche Entera Alpina 1L",
                Descripcion = "Leche entera pasteurizada",
                Precio = 4200,
                Categoria = "Lácteos",
                Stock = 120,
                StockMinimo = 25,
                StockMaximo = 300,
                UnidadMedida = "Tetrapack",
                Estado = true
            },
            new Producto
            {
                Id = "P004",
                Nombre = "Pan Tajado Bimbo 450g",
                Descripcion = "Pan de molde tajado integral",
                Precio = 5600,
                Categoria = "Panadería",
                Stock = 60,
                StockMinimo = 10,
                StockMaximo = 150,
                UnidadMedida = "Paquete",
                Estado = true
            },
            new Producto
            {
                Id = "P005",
                Nombre = "Coca Cola 2L",
                Descripcion = "Bebida gaseosa sabor cola",
                Precio = 6800,
                Categoria = "Bebidas",
                Stock = 200,
                StockMinimo = 30,
                StockMaximo = 400,
                UnidadMedida = "Botella",
                Estado = true
            },
            // Productos de Limpieza
            new Producto
            {
                Id = "P006",
                Nombre = "Detergente Ariel 1kg",
                Descripcion = "Detergente en polvo para ropa",
                Precio = 12500,
                Categoria = "Limpieza",
                Stock = 90,
                StockMinimo = 15,
                StockMaximo = 200,
                UnidadMedida = "Caja",
                Estado = true
            },
            new Producto
            {
                Id = "P007",
                Nombre = "Jabón Rey 300g",
                Descripcion = "Jabón de tocador antibacterial",
                Precio = 2800,
                Categoria = "Aseo Personal",
                Stock = 180,
                StockMinimo = 25,
                StockMaximo = 350,
                UnidadMedida = "Barra",
                Estado = true
            },
            new Producto
            {
                Id = "P008",
                Nombre = "Papel Higiénico Scott 4 rollos",
                Descripcion = "Papel higiénico doble hoja",
                Precio = 8900,
                Categoria = "Aseo Personal",
                Stock = 75,
                StockMinimo = 12,
                StockMaximo = 180,
                UnidadMedida = "Paquete",
                Estado = true
            }
        };

        await _context.Productos.AddRangeAsync(products);
        _logger.LogInformation($"Added {products.Count} products");
    }

}
