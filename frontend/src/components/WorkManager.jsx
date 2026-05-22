import { forwardRef, useImperativeHandle, useState } from 'react'
import axiosClient from '../api/axiosClient'
import './WorkManager.css'

const WorkManager = forwardRef((props, ref) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image: null,
  })
  const [editingId, setEditingId] = useState(null)
  const [error, setError] = useState('')
  const [isExpanded, setIsExpanded] = useState(false)
  const [imagePreview, setImagePreview] = useState(null)

  useImperativeHandle(ref, () => ({
    editWork(work) {
      setFormData({
        title: work.title,
        description: work.description,
        image: null,
      })
      setEditingId(work.id)
      setImagePreview(work.image_url || null)
      setIsExpanded(true)
      setError('')
    },
  }))

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    setError('')
  }

  const handleImageChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData((prev) => ({
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

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.title.trim() || formData.title.length < 3) {
      setError('Nosaukums ir obligāts un jābūt vismaz 3 rakstzīmēm')
      return
    }

    if (!formData.description.trim() || formData.description.length < 5) {
      setError('Apraksts ir obligāts un jābūt vismaz 5 rakstzīmēm')
      return
    }

    if (!editingId && !formData.image) {
      setError('Attēls ir obligāts jaunam darbam')
      return
    }

    try {
      const formDataToSend = new FormData()
      formDataToSend.append('title', formData.title)
      formDataToSend.append('description', formData.description)
      if (formData.image) {
        formDataToSend.append('image', formData.image)
      }

      if (editingId) {
        await axiosClient.post(`/works/${editingId}?_method=PUT`, formDataToSend)
      } else {
        await axiosClient.post('/works', formDataToSend)
      }

      setFormData({
        title: '',
        description: '',
        image: null,
      })
      setEditingId(null)
      setImagePreview(null)
      setIsExpanded(false)
      setError('')
      props.onSuccess?.()
    } catch (err) {
      setError(err.response?.data?.message || 'Kļūda saglabājot darbu')
    }
  }

  const handleCancel = () => {
    setFormData({
      title: '',
      description: '',
      image: null,
    })
    setEditingId(null)
    setImagePreview(null)
    setIsExpanded(false)
    setError('')
  }

  return (
    <div className="work-manager">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="work-toggle-btn"
      >
        {isExpanded ? '▼' : '▶'} {editingId ? 'Rediģēt darbu' : 'Pievienot jaunu darbu'}
      </button>

      {isExpanded && (
        <form onSubmit={handleSubmit} className="work-form">
          <div className="form-group">
            <label htmlFor="title">Nosaukums *</label>
            <input
              id="title"
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Darba nosaukums (min 3 rakstzīmes)"
              minLength="3"
              maxLength="255"
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Apraksts *</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Darba apraksts (min 5 rakstzīmes)"
              minLength="5"
              maxLength="1000"
              rows="4"
            />
          </div>

          <div className="form-group">
            <label htmlFor="image">
              {editingId ? 'Mainīt attēlu' : 'Attēls *'} (JPEG, PNG, GIF - max 5MB)
            </label>
            <input
              id="image"
              type="file"
              name="image"
              onChange={handleImageChange}
              accept="image/jpeg,image/png,image/gif,image/jpg"
              className="file-input"
            />
            {imagePreview && (
              <div className="image-preview">
                <img src={imagePreview} alt="Priekšskatījums" />
              </div>
            )}
          </div>

          {error && <div className="form-error">{error}</div>}

          <div className="form-buttons">
            <button type="submit" className="btn-submit">
              {editingId ? 'Saglabāt izmaiņas' : 'Pievienot darbu'}
            </button>
            <button type="button" className="btn-cancel" onClick={handleCancel}>
              Atcelt
            </button>
          </div>
        </form>
      )}
    </div>
  )
})

WorkManager.displayName = 'WorkManager'

export default WorkManager
