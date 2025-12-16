using System.Text.Json.Serialization;

namespace PoliMarket.Models.Entities;

/// <summary>
/// Represents a product in the inventory (RF3)
/// </summary>
public class Producto
{
    public string Id { get; set; } = string.Empty;
    public string Nombre { get; set; } = string.Empty;
    public string Descripcion { get; set; } = string.Empty;
    public double Precio { get; set; }
    public string Categoria { get; set; } = string.Empty;
    public bool Estado { get; set; } = true;
    public int Stock { get; set; }
    public int StockMinimo { get; set; } = 10;
    public int StockMaximo { get; set; } = 1000;
    public string UnidadMedida { get; set; } = "Unidad";
    public DateTime FechaCreacion { get; set; } = DateTime.UtcNow;
    public DateTime? FechaActualizacion { get; set; }
    
    // Navigation properties
    [JsonIgnore] // Prevent circular reference during JSON serialization
    public List<MovimientoInventario> Movimientos { get; set; } = new();
}

/// <summary>
/// Represents an inventory movement
/// </summary>
public class MovimientoInventario
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string IdProducto { get; set; } = string.Empty;
    public string TipoMovimiento { get; set; } = string.Empty; // "Entrada", "Salida", "Ajuste"
    public int Cantidad { get; set; }
    public int StockAnterior { get; set; }
    public int StockNuevo { get; set; }
    public string Motivo { get; set; } = string.Empty;
    public string? DocumentoReferencia { get; set; }
    public DateTime FechaMovimiento { get; set; } = DateTime.UtcNow;
    public string UsuarioResponsable { get; set; } = string.Empty;
    
    // Navigation properties
    [JsonIgnore] // Prevent circular reference during JSON serialization
    public Producto? Producto { get; set; }
}
