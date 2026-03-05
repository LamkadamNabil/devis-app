import { useState } from 'react'

const STATUT_LABELS = {
  en_attente: { label: 'En attente', color: '#f59e0b', bg: '#fef3c7' },
  paye: { label: 'Payé', color: '#10b981', bg: '#d1fae5' },
  annule: { label: 'Annulé', color: '#ef4444', bg: '#fee2e2' },
}

const fmt = (n) => Number(n).toLocaleString('fr-FR', { minimumFractionDigits: 2 })

export default function DevisHistory({ devisList, onUpdateStatus, onViewDevis }) {
  const [selectedDevis, setSelectedDevis] = useState(null)
  const [showStatusModal, setShowStatusModal] = useState(false)

  const openStatusModal = (devis) => {
    setSelectedDevis(devis)
    setShowStatusModal(true)
  }

  const handleStatusChange = (newStatus) => {
    if (selectedDevis) {
      onUpdateStatus(selectedDevis.id, newStatus)
      setShowStatusModal(false)
      setSelectedDevis(null)
    }
  }

  if (devisList.length === 0) {
    return (
      <div className="card empty-state">
        <p>Aucun devis enregistré. Créez votre premier devis!</p>
      </div>
    )
  }

  return (
    <div className="devis-history">
      <div className="card">
        <h2>Historique des Devis ({devisList.length})</h2>
        
        <div className="history-table-wrap">
          <table className="history-table">
            <thead>
              <tr>
                <th>N° Devis</th>
                <th>Date</th>
                <th>Client</th>
                <th>Objet</th>
                <th>Total TTC</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {devisList.map((devis) => {
                const statut = STATUT_LABELS[devis.statut] || STATUT_LABELS.en_attente
                return (
                  <tr key={devis.id}>
                    <td className="td-ref">{devis.reference}</td>
                    <td className="td-date">{devis.date}</td>
                    <td className="td-client">{devis.client?.nom || '—'}</td>
                    <td className="td-objet">{devis.headerInfo?.objet || '—'}</td>
                    <td className="td-total">{fmt(devis.totalTTC)} DH</td>
                    <td className="td-statut">
                      <span 
                        className="statut-badge"
                        style={{ color: statut.color, backgroundColor: statut.bg }}
                      >
                        {statut.label}
                      </span>
                    </td>
                    <td className="td-actions">
                      <button 
                        className="btn btn-small btn-view"
                        onClick={() => onViewDevis(devis)}
                        title="Voir / Imprimer"
                      >
                        👁️
                      </button>
                      <button 
                        className="btn btn-small btn-edit-status"
                        onClick={() => openStatusModal(devis)}
                        title="Modifier statut"
                      >
                        ✏️
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Status Modal */}
      {showStatusModal && selectedDevis && (
        <div className="modal-overlay" onClick={() => setShowStatusModal(false)}>
          <div className="modal-content status-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Modifier le statut du devis</h3>
              <button className="modal-close" onClick={() => setShowStatusModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <p className="modal-devis-info">
                <strong>Devis N°:</strong> {selectedDevis.reference}<br />
                <strong>Client:</strong> {selectedDevis.client?.nom}<br />
                <strong>Montant:</strong> {fmt(selectedDevis.totalTTC)} DH
              </p>
              
              <div className="status-options">
                {Object.entries(STATUT_LABELS).map(([key, val]) => (
                  <button
                    key={key}
                    className={`status-option ${selectedDevis.statut === key ? 'active' : ''}`}
                    style={{ 
                      borderColor: val.color,
                      backgroundColor: selectedDevis.statut === key ? val.bg : '#fff',
                      color: val.color
                    }}
                    onClick={() => handleStatusChange(key)}
                  >
                    {val.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
