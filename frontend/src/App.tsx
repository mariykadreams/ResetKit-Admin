import { Routes, Route, NavLink } from 'react-router-dom'
import OrdersListPage from './pages/OrdersListPage'
import CreateOrderPage from './pages/CreateOrderPage'
import CsvImportPage from './pages/CsvImportPage'

function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-slate-700/80 bg-slate-900/90 backdrop-blur sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <NavLink to="/" className="text-xl font-semibold text-primary-400 tracking-tight">
              ResetKit Admin
            </NavLink>
            <nav className="flex gap-6">
              <NavLink
                to="/"
                className={({ isActive }) =>
                  `text-sm font-medium transition ${isActive ? 'text-primary-400' : 'text-slate-400 hover:text-slate-200'}`
                }
              >
                Orders
              </NavLink>
              <NavLink
                to="/create"
                className={({ isActive }) =>
                  `text-sm font-medium transition ${isActive ? 'text-primary-400' : 'text-slate-400 hover:text-slate-200'}`
                }
              >
                New Order
              </NavLink>
              <NavLink
                to="/import"
                className={({ isActive }) =>
                  `text-sm font-medium transition ${isActive ? 'text-primary-400' : 'text-slate-400 hover:text-slate-200'}`
                }
              >
                CSV Import
              </NavLink>
            </nav>
          </div>
        </div>
      </header>

      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <Routes>
            <Route path="/" element={<OrdersListPage />} />
            <Route path="/create" element={<CreateOrderPage />} />
            <Route path="/import" element={<CsvImportPage />} />
          </Routes>
        </div>
      </main>
    </div>
  )
}

export default App
