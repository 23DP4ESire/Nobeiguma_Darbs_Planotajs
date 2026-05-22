import { Link, useNavigate } from 'react-router-dom'
import './Pirkumi.css'

export default function Pirkumi({ purchases, onRemovePurchase }) {
  const navigate = useNavigate()

  const formatPrice = (price) => new Intl.NumberFormat('lv-LV', {
    style: 'currency',
    currency: 'EUR',
  }).format(Number(price || 0))

  const handleContinue = (purchaseId) => {
    navigate(`/pirkumi/apmaksai/${purchaseId}`)
  }

  return (
    <main className="pirkumi-page">
      <section className="pirkumi-card">
        <div className="pirkumi-header">
          <div>
            <p className="pirkumi-badge">Pirkumi</p>
            <h1>Saglabātie pirkumi</h1>
            <p className="pirkumi-intro">
              Šeit redzami pakalpojumi, kurus esi pievienojis pirkumu sarakstam.
            </p>
          </div>
          <Link className="pirkumi-back" to="/pak">
            ← Uz pakalpojumiem
          </Link>
        </div>

        {purchases.length === 0 ? (
          <div className="pirkumi-empty">
            <p>Nav saglabātu pirkumu.</p>
            <Link className="pirkumi-empty-link" to="/pak">
              Apskati pakalpojumus
            </Link>
          </div>
        ) : (
          <div className="pirkumi-grid">
            {purchases.map((purchase) => (
              <article className="pirkumi-item" key={purchase.id}>
                <div className="pirkumi-image-wrap">
                  {purchase.image_url ? (
                    <img src={purchase.image_url} alt={purchase.title} className="pirkumi-image" />
                  ) : (
                    <div className="pirkumi-image-placeholder">Šeit redzēsi attēlu</div>
                  )}
                </div>

                <div className="pirkumi-content">
                  <h2>{purchase.title}</h2>
                  <p className="pirkumi-price">{formatPrice(purchase.price)}</p>
                  <p className="pirkumi-description">{purchase.description}</p>

                  <div className="pirkumi-actions">
                    <button
                      type="button"
                      className="pirkumi-button pirkumi-button-primary"
                      onClick={() => handleContinue(purchase.id)}
                    >
                      Turpināt uz apmaksu
                    </button>
                    <button
                      type="button"
                      className="pirkumi-button pirkumi-button-secondary"
                      onClick={() => onRemovePurchase(purchase.id)}
                    >
                      Atcelt
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
