import { useEffect, useMemo, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import axiosClient from '../api/axiosClient'
import ServiceManager from '../components/ServiceManager'
import { SERVICE_TAGS } from '../constants/serviceTags'
import './Services.css'

export default function Services({ user }) {
  const [services, setServices] = useState([])
  const [searchValue, setSearchValue] = useState('')
  const [selectedTag, setSelectedTag] = useState('')
  const [selectedPriceRange, setSelectedPriceRange] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const managerRef = useRef(null)
  const navigate = useNavigate()

  const isAdmin = user?.is_admin

  const formatPrice = (price) => new Intl.NumberFormat('lv-LV', {
    style: 'currency',
    currency: 'EUR',
  }).format(Number(price || 0))

  const priceRanges = [
    { value: '', label: 'Visas cenas' },
    { value: '0-500', label: '0 - 500 EUR' },
    { value: '550-1000', label: '550 - 1000 EUR' },
    { value: '1000-10000', label: '1000 - 10000 EUR' },
  ]

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true)
        const response = await axiosClient.get('/services')
        setServices(response.data.services)
        setError('')
      } catch (err) {
        console.error('Error fetching services:', err)
        setError('Neizdevās ielādēt pakalpojumus.')
      } finally {
        setLoading(false)
      }
    }

    fetchServices()
  }, [])

  const filteredServices = useMemo(() => {
    const normalizedQuery = searchValue.trim().toLowerCase()

    return services.filter((service) => {
      const matchesSearch = !normalizedQuery || (
        service.title.toLowerCase().includes(normalizedQuery)
        || service.description.toLowerCase().includes(normalizedQuery)
      )

      const matchesTag = !selectedTag || (service.tags || []).includes(selectedTag)
      const servicePrice = Number(service.price || 0)

      const matchesPriceRange = !selectedPriceRange || (() => {
        const [min, max] = selectedPriceRange.split('-').map(Number)
        return servicePrice >= min && servicePrice <= max
      })()

      return matchesSearch && matchesTag && matchesPriceRange
    })
  }, [services, searchValue, selectedTag, selectedPriceRange])

  const handleServiceAdded = (newService) => {
    setServices([newService, ...services])
  }

  const handleServiceUpdated = (updatedService) => {
    setServices(services.map(s => s.id === updatedService.id ? updatedService : s))
  }

  const handleServiceDeleted = (serviceId) => {
    setServices(services.filter(s => s.id !== serviceId))
  }

  const handleEditService = (service) => {
    if (managerRef.current) {
      managerRef.current.editService(service)
    }
  }

  const handleDeleteService = async (service) => {
    if (!window.confirm(`Vai tiešām vēlaties dzēst pakalpojumu "${service.title}"?`)) {
      return
    }

    try {
      await axiosClient.delete(`/services/${service.id}`)
      handleServiceDeleted(service.id)
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Kļūda dzēšot pakalpojumu.'
      alert(errorMessage)
    }
  }

  return (
    <main className="services-page">
      <section className="services-top">
        <h1>Atrodi savu sapņu māju</h1>
        <p>Izmanto meklēšanu, lai atrastu mājas tipu, kas vislabāk atbilst tavām vajadzībām.</p>
        <div className="services-controls">
          <input
            type="search"
            className="services-search"
            placeholder="Meklēt sapņu māju..."
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
            aria-label="Meklēt sapņu māju"
            disabled={loading}
          />
          <select
            className="services-tag-filter"
            value={selectedTag}
            onChange={(event) => setSelectedTag(event.target.value)}
            aria-label="Filtrēt pēc taga"
            disabled={loading}
          >
            <option value="">Visi tagi</option>
            {SERVICE_TAGS.map((tag) => (
              <option key={tag} value={tag}>{tag}</option>
            ))}
          </select>
          <select
            className="services-tag-filter services-price-filter"
            value={selectedPriceRange}
            onChange={(event) => setSelectedPriceRange(event.target.value)}
            aria-label="Filtrēt pēc cenas"
            disabled={loading}
          >
            {priceRanges.map((range) => (
              <option key={range.value || 'all'} value={range.value}>{range.label}</option>
            ))}
          </select>
        </div>
      </section>

      {isAdmin && (
        <section className="services-admin">
          <ServiceManager
            ref={managerRef}
            onServiceAdded={handleServiceAdded}
            onServiceUpdated={handleServiceUpdated}
          />
        </section>
      )}

      {error && <p className="services-error">{error}</p>}

      {loading && (
        <section className="services-grid" aria-live="polite">
          <p className="services-loading">Ielādē pakalpojumus...</p>
        </section>
      )}

      {!loading && (
        <section className="services-grid" aria-live="polite">
          {filteredServices.length > 0 ? (
            filteredServices.map((service) => (
              <article
                className="service-card service-card-clickable"
                key={service.id}
                onClick={() => navigate(`/pak/${service.id}`)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    navigate(`/pak/${service.id}`)
                  }
                }}
                role="button"
                tabIndex={0}
              >
                {service.image_url ? (
                  <img 
                    src={service.image_url} 
                    alt={service.title}
                    className="service-card-image"
                    onError={(e) => { e.target.style.display = 'none' }}
                  />
                ) : (
                  <div className="home-image-placeholder">Šeit pievienosi attēlu</div>
                )}
                <h2>{service.title}</h2>
                <p className="service-card-price">{formatPrice(service.price)}</p>
                <p>{service.description}</p>
                <button
                  type="button"
                  className="service-card-buy"
                  onClick={(event) => {
                    event.stopPropagation()
                    navigate(`/pak/pirkt/${service.id}`)
                  }}
                >
                  Pirkt
                </button>
                {service.tags?.length > 0 && (
                  <div className="service-card-tags">
                    {service.tags.map((tag) => (
                      <span key={tag} className="service-card-tag">{tag}</span>
                    ))}
                  </div>
                )}
                {isAdmin && (
                  <div className="service-card-admin-actions">
                    <button
                      className="service-card-edit"
                      onClick={(event) => {
                        event.stopPropagation()
                        handleEditService(service)
                      }}
                    >
                      Rediģēt
                    </button>
                    <button
                      className="service-card-delete"
                      onClick={(event) => {
                        event.stopPropagation()
                        handleDeleteService(service)
                      }}
                    >
                      Dzēst
                    </button>
                  </div>
                )}
              </article>
            ))
          ) : (
            <p className="services-empty">
              {services.length === 0 ? 'Nav atrasts neviens pakalpojums.' : 'Nav atrasts neviens mājas tips šim meklējumam.'}
            </p>
          )}
        </section>
      )}
    </main>
  )
}
