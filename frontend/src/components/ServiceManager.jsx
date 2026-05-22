import { useState, forwardRef, useImperativeHandle } from 'react'
import axiosClient from '../api/axiosClient'
import { SERVICE_TAGS } from '../constants/serviceTags'
import './ServiceManager.css'

export default forwardRef(function ServiceManager({ onServiceAdded, onServiceUpdated }, ref) {
  const [showForm, setShowForm] = useState(false)
  const [editingService, setEditingService] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    detailed_description: '',
    image: null,
    gallery_images: [],
    tags: [],
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [imagePreview, setImagePreview] = useState(null)
  const [galleryPreviews, setGalleryPreviews] = useState([])

  useImperativeHandle(ref, () => ({
    editService(service) {
      setEditingService(service)
      setFormData({
        title: service.title,
        description: service.description,
        price: service.price ?? '',
        detailed_description: service.detailed_description || '',
        image: null,
        gallery_images: [],
        tags: service.tags || [],
      })
      setImagePreview(service.image_url || null)
      setGalleryPreviews(service.gallery_image_urls || [])
      setShowForm(true)
      setError('')
    },
  }))

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      price: '',
      detailed_description: '',
      image: null,
      gallery_images: [],
      tags: [],
    })
    setEditingService(null)
    setError('')
    setSuccess('')
    setImagePreview(null)
    setGalleryPreviews([])
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
    setError('')
  }

  const handleTagToggle = (tag) => {
    setFormData((prev) => {
      const isSelected = prev.tags.includes(tag)

      return {
        ...prev,
        tags: isSelected
          ? prev.tags.filter((existingTag) => existingTag !== tag)
          : [...prev.tags, tag],
      }
    })
    setError('')
  }

  const handleImageChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData(prev => ({
        ...prev,
        image: file,
      }))
      const reader = new FileReader()
      reader.onload = (event) => {
        setImagePreview(event.target.result)
      }
      reader.readAsDataURL(file)
      setError('')
    }
  }

  const handleGalleryChange = async (e) => {
    const files = Array.from(e.target.files || []).slice(0, 4)

    setFormData((prev) => ({
      ...prev,
      gallery_images: files,
    }))

    if (files.length === 0) {
      setGalleryPreviews(editingService?.gallery_image_urls || [])
      return
    }

    const previews = await Promise.all(
      files.map((file) => new Promise((resolve) => {
        const reader = new FileReader()
        reader.onload = (event) => resolve(event.target?.result || '')
        reader.readAsDataURL(file)
      }))
    )

    setGalleryPreviews(previews.filter(Boolean))
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      if (!formData.title.trim() || !formData.description.trim()) {
        setError('Nosaukums un apraksts ir obligāti.')
        setLoading(false)
        return
      }

      if (formData.price === '' || Number.isNaN(Number(formData.price)) || Number(formData.price) < 0) {
        setError('Cena ir obligāta un nevar būt negatīva.')
        setLoading(false)
        return
      }

      const formDataToSend = new FormData()
      formDataToSend.append('title', formData.title)
      formDataToSend.append('description', formData.description)
      formDataToSend.append('price', formData.price)
      formDataToSend.append('detailed_description', formData.detailed_description)

      formData.tags.forEach((tag) => {
        formDataToSend.append('tags[]', tag)
      })

      if (formData.image) {
        formDataToSend.append('image', formData.image)
      }

      formData.gallery_images.forEach((imageFile) => {
        formDataToSend.append('gallery_images[]', imageFile)
      })

      if (editingService) {
        // Update existing service
        const response = await axiosClient.post(`/services/${editingService.id}?_method=PUT`, formDataToSend)

        setSuccess(response.data.message || 'Pakalpojums veiksmīgi atjaunināts!')
        onServiceUpdated(response.data.service)
      } else {
        // Create new service
        const response = await axiosClient.post('/services', formDataToSend)

        setSuccess(response.data.message || 'Pakalpojums veiksmīgi izveidots!')
        onServiceAdded(response.data.service)
      }

      setTimeout(() => {
        setShowForm(false)
        resetForm()
      }, 1500)
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Kļūda saglabājot pakalpojumu.'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="service-manager">
      <div className="service-manager-header">
        <h3>Kartiņu pārvaldība</h3>
        <button
          className="service-manager-btn service-manager-btn-primary"
          onClick={() => {
            resetForm()
            setShowForm(!showForm)
          }}
          disabled={loading}
        >
          {showForm ? 'Atcelt' : '+ Pievienot jaunu kartiņu'}
        </button>
      </div>

      {(error || success) && (
        <div className={`service-manager-message service-manager-${error ? 'error' : 'success'}`}>
          {error || success}
        </div>
      )}

      {showForm && (
        <form className="service-manager-form" onSubmit={handleSubmit}>
          <div className="service-manager-form-group">
            <label className="service-manager-label">Nosaukums *</label>
            <input
              type="text"
              className="service-manager-input"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Ievadiet kartiņas nosaukumu"
              required
              minLength={3}
              maxLength={255}
              disabled={loading}
            />
          </div>

          <div className="service-manager-form-group">
            <label className="service-manager-label">Apraksts *</label>
            <textarea
              className="service-manager-textarea"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Ievadiet kartiņas aprakstu"
              required
              minLength={5}
              maxLength={1000}
              rows={4}
              disabled={loading}
            />
          </div>

          <div className="service-manager-form-group">
            <label className="service-manager-label">Cena (€) *</label>
            <input
              type="number"
              className="service-manager-input"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              placeholder="Ievadiet cenu"
              required
              min="0"
              step="0.01"
              disabled={loading}
            />
          </div>

          <div className="service-manager-form-group">
            <label className="service-manager-label">Paplašināts apraksts</label>
            <textarea
              className="service-manager-textarea"
              name="detailed_description"
              value={formData.detailed_description}
              onChange={handleInputChange}
              placeholder="Plašāks apraksts detaļu lapai"
              maxLength={5000}
              rows={5}
              disabled={loading}
            />
          </div>

          <div className="service-manager-form-group">
            <label className="service-manager-label">Tagi</label>
            <div className="service-manager-tags">
              {SERVICE_TAGS.map((tag) => (
                <label key={tag} className="service-manager-tag-option">
                  <input
                    type="checkbox"
                    checked={formData.tags.includes(tag)}
                    onChange={() => handleTagToggle(tag)}
                    disabled={loading}
                  />
                  <span>{tag}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="service-manager-form-group">
            <label className="service-manager-label">
              {editingService ? 'Mainīt attēlu' : 'Attēls'} (Neobligāts, JPEG/PNG/GIF - max 5MB)
            </label>
            <input
              type="file"
              className="service-manager-file-input"
              accept="image/jpeg,image/png,image/gif,image/jpg"
              onChange={handleImageChange}
              disabled={loading}
            />
            {imagePreview && (
              <div className="service-manager-image-preview">
                <img src={imagePreview} alt="Priekšskatījums" />
              </div>
            )}
          </div>

          <div className="service-manager-form-group">
            <label className="service-manager-label">
              Galerijas attēli (līdz 4, var klikšķināt detaļu lapā)
            </label>
            <input
              type="file"
              className="service-manager-file-input"
              accept="image/jpeg,image/png,image/gif,image/jpg"
              onChange={handleGalleryChange}
              multiple
              disabled={loading}
            />
            {galleryPreviews.length > 0 && (
              <div className="service-manager-gallery-preview">
                {galleryPreviews.map((previewUrl, index) => (
                  <img key={`${previewUrl}-${index}`} src={previewUrl} alt={`Galerijas priekšskatījums ${index + 1}`} />
                ))}
              </div>
            )}
          </div>

          <div className="service-manager-form-actions">
            <button
              type="button"
              className="service-manager-btn service-manager-btn-secondary"
              onClick={() => {
                setShowForm(false)
                resetForm()
              }}
              disabled={loading}
            >
              Atcelt
            </button>
            <button
              type="submit"
              className="service-manager-btn service-manager-btn-primary"
              disabled={loading}
            >
              {loading ? 'Saglabā...' : editingService ? 'Atjaunināt' : 'Izveidot'}
            </button>
          </div>
        </form>
      )}

      <div className="service-manager-list">
        {editingService && (
          <div className="service-manager-editing-note">
            Rediģējat: <strong>{editingService.title}</strong>
          </div>
        )}
      </div>
    </div>
  )
})
