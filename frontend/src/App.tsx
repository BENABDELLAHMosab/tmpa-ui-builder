import { useState, useEffect } from 'react'

function App() {
  const [healthStatus, setHealthStatus] = useState<string>('Vérification en cours...')

  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
    fetch(`${apiUrl}/health`)
      .then(res => res.json())
      .then(data => {
        setHealthStatus(data.status === 'ok' ? "Connecté à l'API Backend" : 'Erreur API')
      })
      .catch(err => {
        setHealthStatus("Échec de la connexion à l'API Backend")
        console.error(err)
      })
  }, [])

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>TMPA UI Builder</h1>
      <p>Bienvenue sur la plateforme interne No-Code/Low-Code.</p>
      <div style={{ marginTop: '2rem', padding: '1rem', border: '1px solid #ccc', borderRadius: '8px' }}>
        <h3>Statut du Backend</h3>
        <p><strong>{healthStatus}</strong></p>
      </div>
    </div>
  )
}

export default App
