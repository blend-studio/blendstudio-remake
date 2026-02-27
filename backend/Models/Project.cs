using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models;

[Table("projects")]
public class Project
{
    [Key]
    [Column("id")]
    public int Id { get; set; }

    [Required]
    [Column("title")]
    [StringLength(255)]
    public string Title { get; set; } = string.Empty;

    [Required]
    [Column("slug")]
    [StringLength(255)]
    public string Slug { get; set; } = string.Empty;

    [Column("client")]
    [StringLength(255)]
    public string Client { get; set; } = string.Empty;

    [Column("services")]
    [StringLength(255)]
    public string Services { get; set; } = string.Empty;

    [Column("description")]
    public string Description { get; set; } = string.Empty;

    [Column("cover_image")]
    [StringLength(255)]
    public string CoverImage { get; set; } = string.Empty;

    [Column("gallery_images")]
    public string GalleryImages { get; set; } = "[]";

    [Column("layout_type")]
    [StringLength(50)]
    public string LayoutType { get; set; } = "default";

    [Column("project_date")]
    public DateTime ProjectDate { get; set; } = DateTime.UtcNow;
}
