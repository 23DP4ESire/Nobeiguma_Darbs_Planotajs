import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Home from './pages/Home'
import About from './pages/About'
import LoginModal from './components/LoginModal'
import './App.css'

function AppContent() {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const [user, setUser] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
  }, [])

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
            <a href="#services">Pakalpojumi</a>
            <a href="#contact">Kontakti</a>
          </nav>

          {/* Auth Section */}
          <div className="auth-section">
            {user ? (
              <>
                <span className="user-welcome">Sveiki, {user.name}!</span>
                <button className="logout-button" onClick={handleLogout}>Izrakstīties</button>
              </>
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
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
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
