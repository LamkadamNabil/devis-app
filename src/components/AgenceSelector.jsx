import { useState, useRef, useEffect } from 'react'

export default function AgenceSelector({ agences, selectedAgence, onSelect, onAddAgence }) {
  const [showModal, setShowModal] = useState(false)
  const [newAgence, setNewAgence] = useState({ nom: '' })
  const [error, setError] = useState('')

  const handleChange = (e) => {
    const id = e.target.value
    if (id === '') {
      onSelect(null)
    } else {
      const agence = agences.find((a) => a.id === Number(id))
      onSelect(agence)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!newAgence.nom.trim()) {
      setError('Le nom de l\'agence est obligatoire')
      return
    }

    const exists = agences.some(
      (a) => a.nom.toLowerCase().trim() === newAgence.nom.toLowerCase().trim()
    )
    if (exists) {
      setError('Une agence avec ce nom existe déjà')
      return
    }

    const maxId = agences.reduce((max, a) => Math.max(max, a.id), 0)
    const agenceToAdd = {
      id: maxId + 1,
      nom: newAgence.nom.trim(),
    }

    onAddAgence(agenceToAdd)
    setShowModal(false)
    setNewAgence({ nom: '' })
    onSelect(agenceToAdd)
  }

  const closeModal = () => {
    setShowModal(false)
    setNewAgence({ nom: '' })
    setError('')
  }

  return (
    <div className="agence-selector">
      <label>
        Agence / Localisation
        <div className="agence-select-row">
          <select
            value={selectedAgence?.id || ''}
            onChange={handleChange}
            className="agence-select"
          >
            <option value="">— Sélectionner une agence —</option>
            {agences.map((a) => (
              <option key={a.id} value={a.id}>
                {a.nom}
              </option>
            ))}
          </select>
          <button
            type="button"
            className="btn btn-add-agence"
            onClick={() => setShowModal(true)}
          >
            + Nouvelle
          </button>
        </div>
      </label>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Ajouter une nouvelle agence</h3>
              <button className="modal-close" onClick={closeModal}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {error && <div className="form-error">{error}</div>}
                <label className="modal-label">
                  Nom de l'agence *
                  <input
                    type="text"
                    value={newAgence.nom}
                    onChange={(e) => { setNewAgence({ nom: e.target.value }); setError('') }}
                    placeholder="Ex: AWB AGENCE CASA IZDIHAR"
                    autoFocus
                  />
                </label>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeModal}>
                  Annuler
                </button>
                <button type="submit" className="btn btn-print">
                  Ajouter l'agence
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
