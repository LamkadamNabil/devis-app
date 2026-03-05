const fmt = (n) => Number(n).toLocaleString('fr-FR', { minimumFractionDigits: 2 })

export default function DevisTable({ lignes, onQtyChange, onRemove, onMoveUp, onMoveDown, tva }) {
  if (lignes.length === 0) {
    return (
      <div className="card empty-state">
        <p>Aucun article ajouté. Utilisez la recherche ci-dessus pour ajouter des articles au devis.</p>
      </div>
    )
  }

  // Group items by agence
  const groupedByAgence = lignes.reduce((acc, ligne, originalIdx) => {
    const agenceKey = ligne.agenceId || 'sans_agence'
    const agenceName = ligne.agenceName || 'Sans agence'
    if (!acc[agenceKey]) {
      acc[agenceKey] = { name: agenceName, items: [] }
    }
    acc[agenceKey].items.push({ ...ligne, originalIdx })
    return acc
  }, {})

  const agenceGroups = Object.entries(groupedByAgence)
  let globalIndex = 0

  return (
    <div className="card table-section">
      <h2>Articles du Devis ({lignes.length})</h2>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Code</th>
              <th>Désignation</th>
              <th>Unité</th>
              <th>Quantité</th>
              <th>P.U. (DH)</th>
              <th>Total HT (DH)</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {agenceGroups.map(([agenceKey, group]) => (
              <>
                {/* Section header row */}
                <tr key={`header-${agenceKey}`} className="agence-header-row">
                  <td colSpan="8" className="agence-header-cell">
                    📍 {group.name}
                  </td>
                </tr>
                {/* Items in this agence */}
                {group.items.map((l) => {
                  globalIndex++
                  const pu = Number(l.prix_actuel)
                  const total = pu * Number(l.quantite)
                  return (
                    <tr key={`${l.CODE}-${l.agenceId || 'null'}`}>
                      <td className="td-num">{globalIndex}</td>
                      <td className="td-code">{Number(l.CODE).toFixed(0)}</td>
                      <td className="td-label">{l.designation}</td>
                      <td className="td-unit">{l.unite}</td>
                      <td className="td-qty">
                        <input
                          type="number"
                          min={0}
                          step="0.01"
                          value={l.quantite}
                          onChange={(e) => onQtyChange(l.CODE, e.target.value, l.agenceId)}
                        />
                      </td>
                      <td className="td-price">{fmt(pu)}</td>
                      <td className="td-total">{fmt(total)}</td>
                      <td className="td-actions">
                        <button title="Monter" onClick={() => onMoveUp(l.originalIdx)} disabled={l.originalIdx === 0}>▲</button>
                        <button title="Descendre" onClick={() => onMoveDown(l.originalIdx)} disabled={l.originalIdx === lignes.length - 1}>▼</button>
                        <button title="Supprimer" className="btn-del" onClick={() => onRemove(l.CODE, l.agenceId)}>🗑</button>
                      </td>
                    </tr>
                  )
                })}
              </>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
