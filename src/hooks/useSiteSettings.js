import { useState, useEffect } from 'react'
import { getSiteSettings } from '../services/api'

export const useSiteSettings = () => {
  const [settings, setSettings] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    getSiteSettings()
      .then(res => setSettings(res.data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  return { settings, loading, error }
}
