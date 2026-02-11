import { useState, useEffect } from 'react'
import axiosClient from './api/axiosClient'
import './App.css'

function App() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Test API connection
  const testConnection = async () => {
    setLoading(true)
    setError(null)
    try {
      // Try to fetch from Laravel API
      const response = await axiosClient.get('/test')
      setData(response.data)
    } catch (err) {
      // If /api/test doesn't exist, that's expected
      if (err.response?.status === 404) {
        setError('API is running but /api/test endpoint not found (this is normal)')
        setData({ message: 'Laravel API is reachable ✓' })
      } else {
        setError(`Error: ${err.message}`)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div>
        <h1>Laravel + React + Vite</h1>
        <div className="card">
          <button onClick={testConnection} disabled={loading}>
            {loading ? 'Testing...' : 'Test API Connection'}
          </button>
          
          {error && <p style={{ color: 'orange' }}>{error}</p>}
          
          {data && (
            <div style={{ marginTop: '20px', padding: '10px', border: '1px solid green', borderRadius: '5px' }}>
              <h3>API Response:</h3>
              <pre>{JSON.stringify(data, null, 2)}</pre>
            </div>
          )}
          
          <p style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
            Make sure Laravel is running on <code>http://localhost:8000</code>
          </p>
        </div>
      </div>
    </>
  )
}

export default App
