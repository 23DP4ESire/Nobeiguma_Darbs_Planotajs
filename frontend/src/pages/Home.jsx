import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import axiosClient from '../api/axiosClient'
import WorkManager from '../components/WorkManager'
import './Home.css'

export default function Home({ user }) {
  const [works, setWorks] = useState([])
  const [loading, setLoading] = useState(true)
  const workManagerRef = useRef()

  useEffect(() => {
    fetchWorks()
  }, [])

  const fetchWorks = async () => {
    try {
      const response = await axiosClient.get('/works')
      setWorks(response.data.works)
    } catch (error) {
      console.error('Error fetching works:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleWorkCreated = () => {
    fetchWorks()
  }

  const handleEditWork = (work) => {
    if (workManagerRef.current) {
      workManagerRef.current.editWork(work)
    }
  }

  const handleDeleteWork = async (workId, title) => {
    if (window.confirm(`Vai jūs pārliecināti, ka vēlaties dzēst darbu "${title}"?`)) {
      try {
        await axiosClient.delete(`/works/${workId}`)
        fetchWorks()
      } catch (error) {
        alert(error.response?.data?.message || 'Kļūda dzēšot darbu')
      }
    }
  }

  const isAdmin = user?.is_admin

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

      {/* Image Gallery Section with works */}
      <section className="gallery">
        <h3>Mūsu darbi</h3>

        {isAdmin && (
          <div className="admin-section">
            <WorkManager ref={workManagerRef} onSuccess={handleWorkCreated} />
          </div>
        )}

        <div className="image-grid">
          {loading ? (
            <p className="loading">Ielādē darbus...</p>
          ) : works.length > 0 ? (
            works.map((work) => (
              <div key={work.id} className="image-spot">
                {work.image_url && (
                  <img
                    src={work.image_url}
                    alt={work.title}
                    onError={(e) => { e.target.src = '/work-placeholder.jpg' }}
                  />
                )}
                <h4>{work.title}</h4>
                <p>{work.description}</p>

                {isAdmin && (
                  <div className="admin-actions">
                    <button
                      className="btn-edit"
                      onClick={() => handleEditWork(work)}
                      title="Rediģēt"
                    >
                      ✎ Rediģēt
                    </button>
                    <button
                      className="btn-delete"
                      onClick={() => handleDeleteWork(work.id, work.title)}
                      title="Dzēst"
                    >
                      × Dzēst
                    </button>
                  </div>
                )}
              </div>
            ))
          ) : (
            <p className="no-works">Nav pieejamu darbu</p>
          )}
        </div>
      </section>
    </>
  )
}

