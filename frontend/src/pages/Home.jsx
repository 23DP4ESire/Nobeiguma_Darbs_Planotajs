import { Link } from 'react-router-dom'
import './Home.css'

export default function Home() {
  return (
    <>
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h2>Mājas projekti visiem</h2>
          <p className="tagline">Pieejami, kvalitatīvi un tieši jums!</p>
          <p className="description">
            Mēs veidojam profesionālus mājas projektus gan privātpersonām, gan uzņēmumiem. 
            Ar mūsu palīdzību jūsu sapnis par ideālu māju kļūst īstenība ar pieņemamām cenām.
          </p>
          <Link to="/about" className="cta-button">Uzziniet vairāk</Link>
        </div>
      </section>

      {/* Image Gallery Section */}
      <section className="gallery">
        <h3>Mūsu darbi</h3>
        <div className="image-grid">
          <div className="image-spot">
            <img src="/modernaaMaja.jpg" alt="Modernu māju projekti" />
            <h4>Moderni projekti</h4>
            <p>Jaunā stila mājas visiem budžetiem</p>
          </div>
          <div className="image-spot">
            <img src="/blueprintMaja.jpeg" alt="Personalizēti risinājumi" />
            <h4>Personalizēti risinājumi</h4>
            <p>Jūsu iepazīšanai pielāgoti projekti</p>
          </div>
        </div>
      </section>
    </>
  )
}

