import { useEffect } from 'react'
import cachetImg from '../images/image.png'

const fmt = (n) => Number(n).toLocaleString('fr-FR', { minimumFractionDigits: 2 })

export default function PrintView({ headerInfo, client, lignes, onClose }) {
  const totalHT = lignes.reduce((acc, l) => acc + Number(l.prix_actuel) * Number(l.quantite), 0)
  const montantTVA = totalHT * (Number(headerInfo.tva) / 100)
  const totalTTC = totalHT + montantTVA

  useEffect(() => {
    const timer = setTimeout(() => window.print(), 300)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="print-view">
      <div className="print-toolbar no-print">
        <button className="btn btn-print" onClick={() => window.print()}>🖨️ Imprimer</button>
        <button className="btn btn-secondary" onClick={onClose}>← Retour</button>
      </div>

      <div className="print-doc sogeray-doc">
        {/* Logo SOGERAY */}
        <div className="sogeray-header">
          <div className="sogeray-logo">
            <div className="logo-icon">
              <div className="orbit orbit-red"></div>
              <div className="orbit orbit-gray"></div>
              <div className="core"></div>
            </div>
            <div className="logo-text">
              <span className="brand-name">SOGERAY</span>
              <span className="brand-sub">Entreprise de Bâtiment & Transport de Marchandises</span>
            </div>
          </div>
        </div>

        {/* Info Table */}
        <table className="info-table">
          <tbody>
            <tr>
              <td className="info-label">Client</td>
              <td className="info-value">{client?.nom || '—'}</td>
              <td className="info-label">A</td>
              <td className="info-value">{headerInfo.contact || '—'}</td>
            </tr>
            <tr>
              <td className="info-label">Service</td>
              <td className="info-value">{headerInfo.service || '—'}</td>
              <td className="info-label">BC N°</td>
              <td className="info-value">{headerInfo.bcNum || '—'}</td>
            </tr>
            <tr>
              <td className="info-label">Objet</td>
              <td className="info-value">{headerInfo.objet || '—'}</td>
              <td className="info-label">devis</td>
              <td className="info-value devis-num">{headerInfo.reference || '—'}</td>
            </tr>
            <tr>
              <td className="info-label">Localisation</td>
              <td className="info-value">{headerInfo.localisation || '—'}</td>
              <td className="info-label">Date</td>
              <td className="info-value">{headerInfo.date}</td>
            </tr>
          </tbody>
        </table>

        {/* Articles Table */}
        <table className="devis-table">
          <thead>
            <tr>
              <th className="col-n">N</th>
              <th className="col-designation">Désignations</th>
              <th className="col-u">U</th>
              <th className="col-qte">Qtés</th>
              <th className="col-pu">PU HT</th>
              <th className="col-total">Montant HT</th>
            </tr>
          </thead>
          <tbody>
            {(() => {
              // Group items by agence
              const groupedByAgence = lignes.reduce((acc, ligne) => {
                const agenceKey = ligne.agenceId || 'sans_agence'
                const agenceName = ligne.agenceName || 'Sans agence'
                if (!acc[agenceKey]) {
                  acc[agenceKey] = { name: agenceName, items: [] }
                }
                acc[agenceKey].items.push(ligne)
                return acc
              }, {})

              const agenceGroups = Object.entries(groupedByAgence)
              return agenceGroups.map(([agenceKey, group]) => (
                <>
                  {/* Agence section header */}
                  <tr key={`header-${agenceKey}`} className="agence-section-row">
                    <td colSpan="6" className="agence-section-cell">
                      {group.name}
                    </td>
                  </tr>
                  {/* Items in this agence */}
                  {group.items.map((l) => {
                    const pu = Number(l.prix_actuel)
                    const total = pu * Number(l.quantite)
                    return (
                      <tr key={`${l.CODE}-${l.agenceId || 'null'}`}>
                        <td className="col-n">{Number(l.CODE).toFixed(0)}</td>
                        <td className="col-designation">{l.designation}</td>
                        <td className="col-u">{l.unite}</td>
                        <td className="col-qte">{Number(l.quantite).toLocaleString('fr-FR')}</td>
                        <td className="col-pu">{fmt(pu)}</td>
                        <td className="col-total">{fmt(total)}</td>
                      </tr>
                    )
                  })}
                </>
              ))
            })()}
          </tbody>
        </table>

        {/* Totaux */}
        <div className="totaux-section">
          <table className="totaux-table">
            <tbody>
              <tr>
                <td>Total HT</td>
                <td>{fmt(totalHT)} DH</td>
              </tr>
              <tr>
                <td>TVA ({headerInfo.tva}%)</td>
                <td>{fmt(montantTVA)} DH</td>
              </tr>
              <tr className="row-ttc">
                <td>Total TTC</td>
                <td>{fmt(totalTTC)} DH</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Cachet et signature */}
        <div className="cachet-section">
          <div className="cachet-box">
            <img src={cachetImg} alt="Cachet SOGERAY" className="cachet-image" />
          </div>
        </div>

        <div className="print-footer">
          SOGERAY S.A.R.L. - 16, Rue Ishak Chirazi 4° Etg App 10 Casablanca MAROC - TEL 212522231823
        </div>
      </div>
    </div>
  )
}
