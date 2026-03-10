import { useState } from 'react'

export default function ClientSelector({ clients, selectedClient, onSelect, onAddClient }) {
  const [showModal, setShowModal] = useState(false)
  const [newClient, setNewClient] = useState({
    nom: '',
    adresse: '',
    ice: '',
  })
  const [error, setError] = useState('')

  const handleChange = (e) => {
    const id = e.target.value
    if (id === '') {
      onSelect(null)
    } else {
      const client = clients.find((c) => c.id === Number(id))
      onSelect(client)
    }
  }

  const handleInputChange = (key) => (e) => {
    setNewClient((prev) => ({ ...prev, [key]: e.target.value }))
    setError('')
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    // Validation
    if (!newClient.nom.trim()) {
      setError('Le nom du client est obligatoire')
      return
    }

    // Check if client with same name already exists
    const exists = clients.some(
      (c) => (c.nom || '').toLowerCase().trim() === newClient.nom.toLowerCase().trim()
    )
    if (exists) {
      setError('Un client avec ce nom existe déjà')
      return
    }

    // Generate new ID
    const maxId = clients.reduce((max, c) => Math.max(max, c.id), 0)
    const clientToAdd = {
      id: maxId + 1,
      nom: newClient.nom.trim(),
      adresse: newClient.adresse.trim(),
      ice: newClient.ice.trim(),
    }

    onAddClient(clientToAdd)
    setShowModal(false)
    setNewClient({ nom: '', adresse: '', ice: '' })
    onSelect(clientToAdd)
  }

  const closeModal = () => {
    setShowModal(false)
    setNewClient({ nom: '', adresse: '', ice: '' })
    setError('')
  }

  return (
    <div className="client-selector">
      <label>
        Client / Maître d'ouvrage
        <div className="client-select-row">
          <select
            value={selectedClient?.id || ''}
            onChange={handleChange}
            className="client-select"
          >
            <option value="">— Sélectionner un client —</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nom} (ID: {c.id})
              </option>
            ))}
          </select>
          <button
            type="button"
            className="btn btn-add-client"
            onClick={() => setShowModal(true)}
          >
            + Nouveau
          </button>
        </div>
      </label>

      {selectedClient && (
        <div className="client-details">
          <span className="client-detail-item">📍 {selectedClient.adresse || '—'}</span>
          <span className="client-detail-item">🏷️ ICE: {selectedClient.ice || '—'}</span>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Ajouter un nouveau client</h3>
              <button className="modal-close" onClick={closeModal}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {error && <div className="form-error">{error}</div>}
                <label className="modal-label">
                  Nom du client *
                  <input
                    type="text"
                    value={newClient.nom}
                    onChange={handleInputChange('nom')}
                    placeholder="Ex: SARL Construction"
                    autoFocus
                  />
                </label>
                <label className="modal-label">
                  Adresse
                  <input
                    type="text"
                    value={newClient.adresse}
                    onChange={handleInputChange('adresse')}
                    placeholder="Ex: 123 Rue des Bâtisseurs, Casablanca"
                  />
                </label>
                <label className="modal-label">
                  ICE
                  <input
                    type="text"
                    value={newClient.ice}
                    onChange={handleInputChange('ice')}
                    placeholder="Ex: 001234567000012"
                  />
                </label>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeModal}>
                  Annuler
                </button>
                <button type="submit" className="btn btn-print">
                  Ajouter le client
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
