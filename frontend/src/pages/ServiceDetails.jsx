import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import axiosClient from '../api/axiosClient'
import { SERVICE_TAGS } from '../constants/serviceTags'
import './ServiceDetails.css'

export default function ServiceDetails({ user }) {
  const { id } = useParams()
  const [service, setService] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    detailed_description: '',
    tags: [],
  })
  const [galleryFiles, setGalleryFiles] = useState([])
  const [galleryPreviews, setGalleryPreviews] = useState([])
  const [galleryError, setGalleryError] = useState('')
  const [removeAllGallery, setRemoveAllGallery] = useState(false)
  const [removeMainImage, setRemoveMainImage] = useState(false)

  const isAdmin = Boolean(user?.is_admin)

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
        setFormData({
          title: response.data.service.title || '',
          description: response.data.service.description || '',
          price: response.data.service.price ?? '',
          detailed_description: response.data.service.detailed_description || '',
          tags: response.data.service.tags || [],
        })
        setError('')
      } catch (err) {
        console.error('Error fetching service details:', err)
        setError('Neizdevās ielādēt pakalpojuma informāciju.')
      } finally {
        setLoading(false)
      }
    }

    fetchService()
  }, [id])

  const galleryImages = useMemo(() => {
    if (!service) {
      return []
    }

    const images = Array.isArray(service.gallery_image_urls) ? [...service.gallery_image_urls] : []

    if (service.image_url && !images.includes(service.image_url)) {
      images.unshift(service.image_url)
    }

    return images
  }, [service])

  useEffect(() => {
    setActiveImageIndex(0)
  }, [service?.id])

  // cleanup object URLs for gallery previews
  useEffect(() => {
    return () => {
      galleryPreviews.forEach((url) => URL.revokeObjectURL(url))
    }
  }, [galleryPreviews])

  const handleInputChange = (event) => {
    const { name, value } = event.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const toggleTag = (tag) => {
    setFormData((prev) => {
      const hasTag = prev.tags.includes(tag)

      return {
        ...prev,
        tags: hasTag ? prev.tags.filter((existingTag) => existingTag !== tag) : [...prev.tags, tag],
      }
    })
  }

  const handleSave = async () => {
    setError('')
    setSaveMessage('')
    setSaving(true)

    try {
      const payload = new FormData()
      payload.append('title', formData.title)
      payload.append('description', formData.description)
      payload.append('price', formData.price)
      payload.append('detailed_description', formData.detailed_description)
      formData.tags.forEach((tag) => payload.append('tags[]', tag))
        // append new gallery files if any
        if (galleryFiles && galleryFiles.length > 0) {
          galleryFiles.forEach((file) => {
            payload.append('gallery_images[]', file)
          })
        }
        if (removeAllGallery) {
          payload.append('remove_gallery', '1')
        }
        if (removeMainImage) {
          payload.append('remove_image', '1')
        }

      const response = await axiosClient.post(`/services/${id}?_method=PUT`, payload)
      setService(response.data.service)
      setFormData({
        title: response.data.service.title || '',
        description: response.data.service.description || '',
        price: response.data.service.price ?? '',
        detailed_description: response.data.service.detailed_description || '',
        tags: response.data.service.tags || [],
      })
      // clear gallery temp state after successful save
      setGalleryFiles([])
      setGalleryPreviews([])
      setGalleryError('')
      setSaveMessage('Izmaiņas veiksmīgi saglabātas!')
      setIsEditing(false)
    } catch (err) {
      setError(err.response?.data?.message || 'Neizdevās saglabāt izmaiņas.')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    if (!service) {
      return
    }

    setFormData({
      title: service.title || '',
      description: service.description || '',
      price: service.price ?? '',
      detailed_description: service.detailed_description || '',
      tags: service.tags || [],
    })
    setIsEditing(false)
    setSaveMessage('')
  }

  const goToPreviousImage = () => {
    setActiveImageIndex((prevIndex) => {
      if (galleryImages.length === 0) {
        return 0
      }

      return prevIndex === 0 ? galleryImages.length - 1 : prevIndex - 1
    })
  }

  const goToNextImage = () => {
    setActiveImageIndex((prevIndex) => {
      if (galleryImages.length === 0) {
        return 0
      }

      return prevIndex === galleryImages.length - 1 ? 0 : prevIndex + 1
    })
  }

  if (loading) {
    return (
      <main className="service-details-page">
        <p className="service-details-loading">Ielādē pakalpojuma informāciju...</p>
      </main>
    )
  }

  if (error || !service) {
    return (
      <main className="service-details-page">
        <p className="service-details-error">{error || 'Pakalpojums nav atrasts.'}</p>
        <Link className="service-details-back" to="/pak">
          ← Atpakaļ uz pakalpojumiem
        </Link>
      </main>
    )
  }

  return (
    <main className="service-details-page">
      <div className="service-details-wrapper">
        <Link className="service-details-back" to="/pak">
          ← Atpakaļ uz pakalpojumiem
        </Link>

        {saveMessage && <p className="service-details-success">{saveMessage}</p>}

        <div className="service-details-layout">
          <section className="service-details-gallery" aria-label="Pakalpojuma attēlu galerija">
            {galleryImages.length > 0 ? (
              <>
                <div className="service-details-main-image-wrap">
                  <img
                    src={galleryImages[activeImageIndex]}
                    alt={`${service.title} attēls ${activeImageIndex + 1}`}
                    className="service-details-main-image"
                  />

                  {galleryImages.length > 1 && (
                    <>
                      <button
                        type="button"
                        className="service-details-nav service-details-nav-prev"
                        onClick={goToPreviousImage}
                        aria-label="Iepriekšējais attēls"
                      >
                        ‹
                      </button>
                      <button
                        type="button"
                        className="service-details-nav service-details-nav-next"
                        onClick={goToNextImage}
                        aria-label="Nākamais attēls"
                      >
                        ›
                      </button>
                    </>
                  )}
                </div>

                {galleryImages.length > 1 && (
                  <div className="service-details-thumbs">
                    {galleryImages.map((imageUrl, index) => (
                      <button
                        type="button"
                        key={`${imageUrl}-${index}`}
                        className={`service-details-thumb ${index === activeImageIndex ? 'active' : ''}`}
                        onClick={() => setActiveImageIndex(index)}
                        aria-label={`Atvērt attēlu ${index + 1}`}
                      >
                        <img src={imageUrl} alt={`${service.title} sīktēls ${index + 1}`} />
                      </button>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="service-details-image-placeholder">Attēli nav pievienoti.</div>
            )}
          </section>

          <section className="service-details-side-panel">
            {isEditing ? (
              <>
                <h1>Rediģēt kartīti</h1>
                <label className="service-details-label">Nosaukums</label>
                <input
                  className="service-details-input"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  maxLength={255}
                  disabled={saving}
                />

                <label className="service-details-label">Apraksts</label>
                <textarea
                  className="service-details-textarea"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  maxLength={1000}
                  rows={4}
                  disabled={saving}
                />

                <label className="service-details-label">Cena (€)</label>
                <input
                  className="service-details-input"
                  name="price"
                  type="number"
                  value={formData.price}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  disabled={saving}
                />

                <label className="service-details-label">Paplašināts apraksts</label>
                <textarea
                  className="service-details-textarea"
                  name="detailed_description"
                  value={formData.detailed_description}
                  onChange={handleInputChange}
                  maxLength={5000}
                  rows={6}
                  disabled={saving}
                />

                <label className="service-details-label">Tagi</label>
                <div className="service-details-tags service-details-tags-editable">
                  {SERVICE_TAGS.map((tag) => (
                    <label key={tag} className="service-details-tag-toggle">
                      <input
                        type="checkbox"
                        checked={formData.tags.includes(tag)}
                        onChange={() => toggleTag(tag)}
                        disabled={saving}
                      />
                      <span>{tag}</span>
                    </label>
                  ))}
                </div>

                <label className="service-details-label">Galerijas attēli (līdz 4)</label>
                {service?.gallery_image_urls?.length > 0 && !removeAllGallery && (
                  <div className="service-details-existing-gallery">
                    <div className="service-details-existing-gallery-list">
                      {service.gallery_image_urls.map((url, idx) => (
                        <div className="service-details-existing-gallery-item" key={url + idx}>
                          <img src={url} alt={`Existing ${idx + 1}`} />
                        </div>
                      ))}
                    </div>
                    <button
                      type="button"
                      className="service-details-btn service-details-btn-secondary"
                      onClick={() => setRemoveAllGallery(true)}
                      disabled={saving}
                    >
                      Noņemt visus galerijas attēlus
                    </button>
                  </div>
                )}

                {removeAllGallery && (
                  <div className="service-details-warning">Galerijas attēli tiks dzēsti pēc saglabāšanas.</div>
                )}

                {service?.image_url && !removeMainImage && (
                  <div className="service-details-main-image-control">
                    <img src={service.image_url} alt="Galvenais attēls" />
                    <button
                      type="button"
                      className="service-details-btn service-details-btn-secondary"
                      onClick={() => setRemoveMainImage(true)}
                      disabled={saving}
                    >
                      Noņemt galveno attēlu
                    </button>
                  </div>
                )}

                {removeMainImage && (
                  <div className="service-details-warning">Galvenais attēls tiks dzēsts pēc saglabāšanas.</div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => {
                    setGalleryError('')
                    const files = Array.from(e.target.files || [])
                    const existingCount = (service?.gallery_image_urls?.length || 0) + (service?.image_url ? 1 : 0)
                    const allowed = Math.max(0, 4 - existingCount)
                    if (files.length > allowed) {
                      setGalleryError(`Var pievienot tikai ${allowed} failu(šus).`)
                    }
                    const accepted = files.slice(0, allowed)
                    setGalleryFiles(accepted)
                    // create previews
                    const previews = accepted.map((file) => URL.createObjectURL(file))
                    // revoke previous previews
                    galleryPreviews.forEach((url) => URL.revokeObjectURL(url))
                    setGalleryPreviews(previews)
                  }}
                  disabled={saving}
                />
                {galleryError && <p className="service-details-error-inline">{galleryError}</p>}

                {galleryPreviews.length > 0 && (
                  <div className="service-details-gallery-previews">
                    {galleryPreviews.map((src, idx) => (
                      <div key={src} className="service-details-gallery-preview">
                        <img src={src} alt={`Preview ${idx + 1}`} />
                      </div>
                    ))}
                  </div>
                )}

                <div className="service-details-actions">
                  <button
                    type="button"
                    className="service-details-btn service-details-btn-secondary"
                    onClick={handleCancel}
                    disabled={saving}
                  >
                    Atcelt
                  </button>
                  <button
                    type="button"
                    className="service-details-btn service-details-btn-primary"
                    onClick={handleSave}
                    disabled={saving}
                  >
                    {saving ? 'Saglabā...' : 'Saglabāt'}
                  </button>
                </div>
              </>
            ) : (
              <>
                <h1>{service.title}</h1>

                <p className="service-details-price">{formatPrice(service.price)}</p>

                {service.tags?.length > 0 && (
                  <div className="service-details-tags">
                    {service.tags.map((tag) => (
                      <span key={tag} className="service-details-tag">{tag}</span>
                    ))}
                  </div>
                )}

                <section className="service-details-content">
                  <h2>Apraksts</h2>
                  <p>{service.description}</p>

                  {service.detailed_description && (
                    <>
                      <h3>Paplašināts apraksts</h3>
                      <p>{service.detailed_description}</p>
                    </>
                  )}
                </section>

                <div className="service-details-actions">
                  <Link className="service-details-btn service-details-btn-primary service-details-buy-link" to={`/pak/pirkt/${service.id}`}>
                    Pirkt
                  </Link>
                </div>

                {isAdmin && (
                  <div className="service-details-actions">
                    <button
                      type="button"
                      className="service-details-btn service-details-btn-primary"
                      onClick={() => {
                        setIsEditing(true)
                        setSaveMessage('')
                      }}
                    >
                      Rediģēt lapu
                    </button>
                  </div>
                )}
              </>
            )}
          </section>
        </div>

        {error && <p className="service-details-error-inline">{error}</p>}
      </div>
    </main>
  )
}
