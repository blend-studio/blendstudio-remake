using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class SeedAdminUser : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "users",
                columns: new[] { "email", "password_hash", "created_at" },
                values: new object[] { "admin@blendstudio.it", "$2b$11$WuHoMTdOFJLWl0erOw4BrOBLS06eoiOm7HicZdxrWkBCgJ3V5NW2W", new DateTime(2026, 3, 5, 0, 0, 0, DateTimeKind.Utc) }
            );
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "users",
                keyColumn: "email",
                keyValue: "admin@blendstudio.it"
            );
        }
    }
}
