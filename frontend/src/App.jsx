import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import Home from './pages/Home'
import About from './pages/About'
import './App.css'

function App() {
  return (
    <Router>
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
      </div>
    </Router>
  )
}

export default App
