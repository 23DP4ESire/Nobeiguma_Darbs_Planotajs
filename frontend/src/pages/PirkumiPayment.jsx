import { Link, useNavigate, useParams } from 'react-router-dom'
import './PirkumiPayment.css'

export default function PirkumiPayment({ purchases, onRemovePurchase }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const purchase = purchases.find((item) => String(item.id) === String(id))

  const formatPrice = (price) => new Intl.NumberFormat('lv-LV', {
    style: 'currency',
    currency: 'EUR',
  }).format(Number(price || 0))

  const handleCancel = () => {
    navigate('/pirkumi')
  }

  const handlePay = () => {
    onRemovePurchase(Number(id))
    navigate('/pirkumi')
  }

  if (!purchase) {
    return (
      <main className="pirkumi-payment-page">
        <p className="pirkumi-payment-error">Pirkums nav atrasts.</p>
        <Link className="pirkumi-payment-back" to="/pirkumi">
          ← Atpakaļ uz pirkumiem
        </Link>
      </main>
    )
  }

  return (
    <main className="pirkumi-payment-page">
      <section className="pirkumi-payment-card">
        <Link className="pirkumi-payment-back" to="/pirkumi">
          ← Atpakaļ uz pirkumiem
        </Link>

        <p className="pirkumi-payment-badge">Apmaksa</p>
        <h1>{purchase.title}</h1>
        <p className="pirkumi-payment-price">{formatPrice(purchase.price)}</p>
        <p className="pirkumi-payment-text">
          Šis ir nākamais solis uz apmaksu. Pēc apmaksas pirkums tiks noņemts no saraksta.
        </p>

        <div className="pirkumi-payment-actions">
          <button type="button" className="pirkumi-payment-button pirkumi-payment-button-primary" onClick={handlePay}>
            Maksāt
          </button>
          <button type="button" className="pirkumi-payment-button pirkumi-payment-button-secondary" onClick={handleCancel}>
            Atcelt
          </button>
        </div>
      </section>
    </main>
  )
}
