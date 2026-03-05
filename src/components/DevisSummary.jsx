const fmt = (n) => Number(n).toLocaleString('fr-FR', { minimumFractionDigits: 2 })

export default function DevisSummary({ lignes, tva }) {
  const totalHT = lignes.reduce((acc, l) => acc + Number(l.prix_actuel) * Number(l.quantite), 0)
  const montantTVA = totalHT * (Number(tva) / 100)
  const totalTTC = totalHT + montantTVA

  return (
    <div className="card summary-card">
      <h2>Récapitulatif</h2>
      <table className="summary-table">
        <tbody>
          <tr>
            <td>Total HT</td>
            <td className="summary-val">{fmt(totalHT)} DH</td>
          </tr>
          <tr>
            <td>TVA ({tva}%)</td>
            <td className="summary-val">{fmt(montantTVA)} DH</td>
          </tr>
          <tr className="summary-ttc">
            <td>Total TTC</td>
            <td className="summary-val">{fmt(totalTTC)} DH</td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}
