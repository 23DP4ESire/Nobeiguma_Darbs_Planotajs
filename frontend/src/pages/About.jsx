import { Link } from 'react-router-dom'
import './About.css'

export default function About() {
  return (
    <div className="about-container">
      {/* About Hero */}
      <section className="about-hero">
        <div className="about-hero-content">
          <h2>Par mums</h2>
          <p>Mēs radām kvalitatīvus mājas projektus ar labākajām cenām</p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="mission-section">
        <div className="section-content">
          <h3>Mūsu misija</h3>
          <p>
            Mēs nodrošinām pieejamus un kvalitatīvus mājas projektus visiem - privātpersonām un uzņēmumiem. 
            Mūsu mērķis ir padarīt sapņu māju plānošanu vienkāršu, lētu un jautru. Katrs klients mums ir svarīgs, 
            un mēs vēlamies redzēt laimīgas personas, kas ar prieku noskatās uz saviem jaunajiem projektiem.
          </p>
        </div>
      </section>

      {/* Values Section */}
      <section className="values-section">
        <h3>Kāpēc izvēlēties mūs?</h3>
        <div className="values-grid">
          <div className="value-card">
            <h4>Pieejama cena</h4>
            <p>Mūsu pakalpojumi ir pieejami jebkuram budžetam.</p>
          </div>
          <div className="value-card">
            <h4>Ātri rezultāti</h4>
            <p>Iegūstiet savus mājas projektus ātri un efektīvi.</p>
          </div>
          <div className="value-card">
            <h4>Personīga pieeja</h4>
            <p>Katrs projekts tiek pielāgots jūsu prasībām.</p>
          </div>
          <div className="value-card">
            <h4>Laimīgi klients</h4>
            <p>Jūsu apmierinātība ir mūsu galvenais mērķis.</p>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="team-section">
        <div className="section-content">
          <h3>Mūsu komanda</h3>
          <p>
            Mūs veido pieredzējušu profesionāļu komanda, kuri jau gadus veidojusi mājas projektus. 
            Mēs zinām, ko nepieciešams, lai tas būtu ideāli - no skicēm līdz pēdējām detaļām. 
            Mūsu pieredze un dedikācija garantē, ka jūs saņemsit vislabāko rezultātu.
          </p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="about-cta">
        <h3>Gatavi sākt?</h3>
        <p>Dodieties uz sākotnējo lapu un izpilniet savu sapni!</p>
        <Link to="/" className="back-button">Atgriezties sākumā</Link>
      </section>
    </div>
  )
}
