# ResetKit Admin - Tax Compliance System

A full-stack admin application for managing sales tax compliance on drone delivery orders in New York State. The system calculates composite sales tax based on delivery location (GPS coordinates) using a **local geolocation dataset** — no external API calls — and stores tax breakdowns for auditing.

## Architecture Overview

- **Backend**: ASP.NET Core 8 Web API with MVC, EF Core, SQL Server
- **Frontend**: React 18 + Vite + Tailwind CSS admin dashboard
- **Geolocation**: Local NY cities dataset (`ny_cities.csv`) with Haversine nearest-city lookup
- **Tax Logic**: NYS Publication 718 combined rates by county/city; `ITaxService` + `IGeoLocationService` for clear separation of concerns

## Project Structure

```
ResetKit Admin/
├── backend/
│   └── ResetKit.Admin.Api/
│       ├── Controllers/           # Thin API controllers (OrdersController)
│       ├── Data/                  # DbContext, migrations, ny_cities.csv
│       ├── Domain/                # Order entity
│       ├── Dtos/                  # Request/response DTOs
│       ├── Middleware/            # Exception handling
│       ├── Repositories/          # OrderRepository
│       └── Services/              # Business logic
│           ├── TaxService.cs           # Tax calculation (uses IGeoLocationService)
│           ├── NyPub718Rates.cs        # NYS Publication 718 rate tables
│           ├── IGeoLocationService.cs  # Geolocation abstraction
│           ├── LocalGeoLocationService.cs  # Haversine nearest-city lookup
│           ├── GeoLocationResult.cs     # State, County, City result
│           ├── OrderService.cs
│           └── ImportProgressStore.cs
├── frontend/
│   └── src/
│       ├── components/            # OrderTable, OrderForm, Filters, Pagination
│       ├── pages/                 # OrdersList, CreateOrder, CsvImport
│       └── services/              # Axios API layer (api.ts)
└── README.md
```

## How Location Is Found

Location resolution is **fully local** — no external geocoding API is used.

### 1. Dataset

The system uses `Data/ny_cities.csv`, a dataset of ~1,600 cities in New York State with columns:

| Column     | Description                    |
|-----------|--------------------------------|
| STATE_CODE| NY                             |
| STATE_NAME| New York                       |
| CITY      | City/place name                |
| COUNTY    | County name                    |
| LATITUDE  | WGS84 decimal degrees          |
| LONGITUDE | WGS84 decimal degrees          |

### 2. Bounding Box Check

Before lookup, coordinates are validated against a New York State bounding box:

- **Latitude**: 40.4° to 45.1° (Long Island to Canadian border)
- **Longitude**: -79.8° to -71.7° (western NY to eastern Long Island)

If coordinates fall outside this box, the system throws an error: *"Coordinates are outside New York State. Tax calculation is only supported for addresses within New York."*

### 3. Nearest-City Lookup (Haversine Formula)

For coordinates inside NY, the system finds the **nearest city** in the dataset using the **Haversine formula**:

1. For each city in the dataset, compute the great-circle distance (in km) between the input point `(lat, lon)` and the city’s coordinates.
2. The Haversine formula accounts for Earth’s curvature using radius 6,371 km.
3. The city with the **smallest distance** is selected as the delivery location.

This yields **State**, **County**, and **City**, which are passed to the tax rate lookup.

### 4. Data Flow

```
Input (lat, lon, subtotal)
    │
    ▼
┌─────────────────────────────────────┐
│ LocalGeoLocationService             │
│ • Bounding box check                │
│ • Haversine nearest-city lookup     │
│ • Returns: State, County, City      │
└─────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────┐
│ NyPub718Rates.TryResolve(County, City)│
│ • County-level rates                │
│ • City overrides (e.g. NYC, Utica)  │
│ • Returns: CompositeRate, ReportingCode│
└─────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────┐
│ TaxService                          │
│ • TaxAmount = Subtotal × CompositeRate│
│ • TotalAmount = Subtotal + TaxAmount │
└─────────────────────────────────────┘
```

## Tax Calculation

Tax rates come from **NYS Publication 718** (combined state + local rates by jurisdiction):

- **State rate**: 4%
- **MCTD special rate**: 0.375% (Metropolitan Commuter Transportation District — NYC, Nassau, Suffolk, etc.)
- **Local rate**: Varies by county and city (e.g. Albany 8%, Erie 8.75%, NYC 8.875%)

`TaxAmount = Subtotal × CompositeTaxRate`  
`TotalAmount = Subtotal + TaxAmount`

City-level overrides apply for places like Utica, Rome, Ithaca, and New York City boroughs (Bronx, Kings, Queens, etc.).

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

| Method | Endpoint              | Description                          |
|--------|-----------------------|--------------------------------------|
| POST   | /orders/import        | Import orders from CSV               |
| POST   | /orders               | Create a single order                |
| GET    | /orders               | List orders (pagination, filters)    |
| GET    | /orders/import/progress/{id} | Real-time CSV import progress |

### CSV Import Format

Expected columns: `latitude`, `longitude`, `subtotal`, `timestamp`

Example:

```csv
latitude,longitude,subtotal,timestamp
40.7128,-74.0060,29.99,2024-02-20T10:00:00
40.7589,-73.9851,15.50,2024-02-20T11:30:00
42.6525,-73.7566,100.00,2024-02-20T12:00:00
```

A sample file is at `backend/sample-orders.csv`.

## Assumptions & Notes

1. **Geolocation**: Fully local; uses `ny_cities.csv` and Haversine nearest-city lookup. No external geocoding API.
2. **Tax rates**: NYS Publication 718 combined rates by county/city. Effective date is configurable in `NyPub718Rates`.
3. **Coordinates**: Must be within New York State bounding box; otherwise a 400 error is returned.
4. **Timestamps**: CSV `timestamp` is optional; if missing, `DateTime.UtcNow` is used.
5. **CORS**: Default policy allows any origin for development.
6. **Validation**: Request validation uses data annotations; `[ApiController]` handles model validation.

## License

Internal use — ResetKit startup.
