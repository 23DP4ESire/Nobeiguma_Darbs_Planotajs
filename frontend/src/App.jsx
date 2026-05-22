import { BrowserRouter as Router, Routes, Route, Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import Home from './pages/Home'
import About from './pages/About'
import Services from './pages/Services'
import ServiceDetails from './pages/ServiceDetails'
import BuyService from './pages/BuyService'
import Pirkumi from './pages/Pirkumi'
import PirkumiPayment from './pages/PirkumiPayment'
import Profile from './pages/Profile'
import LoginModal from './components/LoginModal'
import './App.css'

function ProtectedRoute({ user, children }) {
  if (!user) {
    return <Navigate to="/" replace />
  }

  return children
}

function RedirectToShortServiceRoute() {
  const { id } = useParams()
  return <Navigate to={`/pak/${id}`} replace />
}

function RedirectToShortBuyRoute() {
  const { id } = useParams()
  return <Navigate to={`/pak/pirkt/${id}`} replace />
}

const savedPurchasesKey = 'savedPurchases'

function loadSavedPurchases() {
  const storedPurchases = localStorage.getItem(savedPurchasesKey)

  if (!storedPurchases) {
    return []
  }

  try {
    const parsedPurchases = JSON.parse(storedPurchases)
    return Array.isArray(parsedPurchases) ? parsedPurchases : []
  } catch {
    localStorage.removeItem(savedPurchasesKey)
    return []
  }
}

function AppContent() {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('user')

    if (!storedUser) {
      return null
    }

    try {
      return JSON.parse(storedUser)
    } catch {
      localStorage.removeItem('user')
      return null
    }
  })
  const [purchases, setPurchases] = useState(loadSavedPurchases)
  const navigate = useNavigate()
  const profileInitial = user?.name?.trim()?.charAt(0)?.toUpperCase() || 'P'

  useEffect(() => {
    localStorage.setItem(savedPurchasesKey, JSON.stringify(purchases))
  }, [purchases])

  const addPurchase = (service) => {
    if (!service?.id) {
      return
    }

    setPurchases((currentPurchases) => {
      if (currentPurchases.some((purchase) => purchase.id === service.id)) {
        return currentPurchases
      }

      return [...currentPurchases, {
        id: service.id,
        title: service.title,
        price: service.price,
        image_url: service.image_url,
        description: service.description,
      }]
    })
  }

  const removePurchase = (serviceId) => {
    setPurchases((currentPurchases) => currentPurchases.filter((purchase) => purchase.id !== serviceId))
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    navigate('/')
  }

  return (
    <div className="container">
      {/* Header */}
      <header className="header">
        <div className="header-content">
          <Link to="/" className="logo">Plānotājs</Link>

          {/* Navigation Menu */}
          <nav className="nav-menu">
            <Link to="/">Sākums</Link>
            <Link to="/about">Par mums</Link>
            <Link to="/pak">Pakalpojumi</Link>
            <a href="#contact">Kontakti</a>
          </nav>

          {/* Auth Section */}
          <div className="auth-section">
            {user ? (
              <div className="auth-actions">
                <span className="user-welcome">Sveiki, {user.name}!</span>
                <Link to="/pirkumi" className="purchases-button" aria-label="Atvērt pirkumus">
                  <span className="purchases-button-text">Pirkumi</span>
                  {purchases.length > 0 && <span className="purchases-count">{purchases.length}</span>}
                </Link>
                <Link to="/profile" className="profile-button" aria-label="Atvērt profilu">
                  {profileInitial}
                </Link>
                <button className="logout-button" onClick={handleLogout}>Izrakstīties</button>
              </div>
            ) : (
              <button
                className="login-button"
                onClick={() => setIsLoginModalOpen(true)}
              >
                Pierakstīties
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Routes */}
      <Routes>
        <Route path="/" element={<Home user={user} />} />
        <Route path="/about" element={<About />} />
        <Route path="/pak" element={<Services user={user} />} />
        <Route path="/pak/:id" element={<ServiceDetails user={user} />} />
        <Route
          path="/pak/pirkt/:id"
          element={<BuyService onSavePurchase={addPurchase} savedPurchases={purchases} />}
        />
        <Route path="/pirkumi" element={<Pirkumi purchases={purchases} onRemovePurchase={removePurchase} />} />
        <Route
          path="/pirkumi/apmaksai/:id"
          element={<PirkumiPayment purchases={purchases} onRemovePurchase={removePurchase} />}
        />
        <Route path="/pakalpojumi" element={<Navigate to="/pak" replace />} />
        <Route path="/pakalpojumi/:id" element={<RedirectToShortServiceRoute />} />
        <Route path="/pakalpojumi/pirkt/:id" element={<RedirectToShortBuyRoute />} />
        <Route
          path="/profile"
          element={(
            <ProtectedRoute user={user}>
              <Profile user={user} onUserUpdate={setUser} />
            </ProtectedRoute>
          )}
        />
      </Routes>

      {/* Footer */}
      <footer className="footer">
        <p>&copy; 2026 Mājas Projekti. Visi tiesības aizsargātas.</p>
      </footer>

      {/* Login Modal */}
      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
    </div>
  )
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  )
}

export default App
