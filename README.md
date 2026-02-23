# ResetKit Admin - Tax Compliance System

A full-stack admin application for managing sales tax compliance on drone delivery orders in New York State. The system calculates composite sales tax based on delivery location (GPS coordinates) and stores tax breakdowns for auditing.

## Architecture Overview

- **Backend**: ASP.NET Core 8 Web API with MVC, EF Core, SQL Server
- **Frontend**: React 18 + Vite + Tailwind CSS admin dashboard
- **Tax Logic**: Pluggable `ITaxService` — currently uses simplified fixed rates; designed for easy replacement with a real tax API or geospatial dataset

## Project Structure

```
ResetKit Admin/
├── backend/
│   └── ResetKit.Admin.Api/
│       ├── Controllers/     # Thin API controllers
│       ├── Data/            # DbContext, migrations
│       ├── Domain/          # Order entity
│       ├── Dtos/            # Request/response DTOs
│       ├── Middleware/      # Exception handling
│       ├── Repositories/    # Data access
│       └── Services/        # Business logic, TaxService
├── frontend/
│   └── src/
│       ├── components/      # OrderTable, Pagination, Filters, etc.
│       ├── pages/           # Orders, Create, Import
│       └── services/        # Axios API layer
└── README.md
```

## Tax Calculation (Simplified Logic)

For this implementation, **fixed rates** are used. In production, replace `TaxService` with a real tax API (e.g. TaxJar, Avalara) or geospatial lookup without changing controllers.

| Component   | Rate  |
|------------|-------|
| State      | 4.0%  |
| County     | 4.0%  |
| City       | 0.5%  |
| Special    | 0.375%|
| **Composite** | **8.875%** |

- `TaxAmount = Subtotal × CompositeTaxRate`
- `TotalAmount = Subtotal + TaxAmount`

## Prerequisites

- **.NET 8 SDK**
- **Node.js 18+** (for frontend)
- **SQL Server** (LocalDB, Express, or full) — or update connection string for another provider

## Database Setup

1. Ensure SQL Server is running (LocalDB is used by default).
2. Connection string in `appsettings.json`:
   ```json
   "ConnectionStrings": {
     "DefaultConnection": "Server=(localdb)\\mssqllocaldb;Database=ResetKitAdmin;Trusted_Connection=True;TrustServerCertificate=True;"
   }
   ```
3. Migrations run automatically on startup. To create new migrations:
   ```bash
   dotnet tool install --global dotnet-ef
   dotnet ef migrations add MigrationName --project backend/ResetKit.Admin.Api
   ```

## How to Run Locally

### Backend

```bash
cd backend/ResetKit.Admin.Api
dotnet restore
dotnet run
```

- API: http://localhost:5000  
- Swagger: http://localhost:5000/swagger  

### Frontend

```bash
cd frontend
npm install
npm run dev
```

- App: http://localhost:3000  
- API requests are proxied from `/api` to `http://localhost:5000`  

### Running Both

1. Start the backend first (`dotnet run` in `backend/ResetKit.Admin.Api`).
2. Start the frontend (`npm run dev` in `frontend`).
3. Open http://localhost:3000 in the browser.

## API Endpoints

| Method | Endpoint           | Description                          |
|--------|--------------------|--------------------------------------|
| POST   | /orders/import     | Import orders from CSV               |
| POST   | /orders            | Create a single order                |
| GET    | /orders            | List orders (pagination, filters)    |

### CSV Import Format

Expected columns: `latitude`, `longitude`, `subtotal`, `timestamp`

Example:

```csv
latitude,longitude,subtotal,timestamp
40.7128,-74.0060,29.99,2024-02-20T10:00:00
40.7589,-73.9851,15.50,2024-02-20T11:30:00
```

A sample file is at `backend/sample-orders.csv`.

## Assumptions & Notes

1. **Tax rates**: Simplified fixed rates are used. In production, integrate a real tax API or geospatial service for jurisdiction-specific rates.
2. **Coordinates**: Currently passed through to `TaxService` but not used for lookup. The interface supports future geo resolution.
3. **Timestamps**: CSV `timestamp` is optional; if missing, `DateTime.UtcNow` is used.
4. **CORS**: Default policy allows any origin for development.
5. **Validation**: Request validation uses data annotations; `[ApiController]` handles model validation.

## License

Internal use — ResetKit startup.
