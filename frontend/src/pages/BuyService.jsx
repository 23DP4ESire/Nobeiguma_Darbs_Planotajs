import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import axiosClient from '../api/axiosClient'
import './BuyService.css'

export default function BuyService({ onSavePurchase, savedPurchases }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const [service, setService] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const formatPrice = (price) => new Intl.NumberFormat('lv-LV', {
    style: 'currency',
    currency: 'EUR',
  }).format(Number(price || 0))

  useEffect(() => {
    const fetchService = async () => {
      try {
        setLoading(true)
        const response = await axiosClient.get(`/services/${id}`)
        setService(response.data.service)
        setError('')
      } catch (err) {
        console.error('Error fetching service for purchase:', err)
        setError('Neizdevās ielādēt pakalpojumu.')
      } finally {
        setLoading(false)
      }
    }

    fetchService()
  }, [id])

  const handleCancel = () => {
    navigate('/pak')
  }

  const handlePurchase = () => {
    if (!service) {
      return
    }

    if (savedPurchases?.some((purchase) => purchase.id === service.id)) {
      navigate('/pirkumi')
      return
    }

    if (onSavePurchase) {
      onSavePurchase(service)
    }

    navigate('/pirkumi')
  }

  if (loading) {
    return (
      <main className="buy-page">
        <p className="buy-loading">Ielādē pirkuma skatu...</p>
      </main>
    )
  }

  if (error || !service) {
    return (
      <main className="buy-page">
        <p className="buy-error">{error || 'Pakalpojums nav atrasts.'}</p>
        <Link className="buy-back" to="/pak">
          ← Atpakaļ uz pakalpojumiem
        </Link>
      </main>
    )
  }

  return (
    <main className="buy-page">
      <section className="buy-card">
        <div className="buy-media">
          {service.image_url ? (
            <img src={service.image_url} alt={service.title} className="buy-image" />
          ) : (
            <div className="buy-image-placeholder">Šeit redzēsi attēlu</div>
          )}
        </div>

        <div className="buy-content">
          <Link className="buy-back" to="/pak">
            ← Atpakaļ uz pakalpojumiem
          </Link>

          <h1>{service.title}</h1>
          <p className="buy-price">{formatPrice(service.price)}</p>

          <div className="buy-actions">
            <button type="button" className="buy-button buy-button-primary" onClick={handlePurchase}>
              Pirkt
            </button>
            <button type="button" className="buy-button buy-button-secondary" onClick={handleCancel}>
              Atcelt
            </button>
          </div>
        </div>
      </section>
    </main>
  )
}