import ClientSelector from './ClientSelector'

export default function DevisHeader({
  info,
  onChange,
  clients,
  selectedClient,
  onSelectClient,
  onAddClient,
}) {
  const set = (key) => (e) => onChange({ ...info, [key]: e.target.value })

  return (
    <div className="card devis-header-form">
      <h2>Informations du Devis</h2>
      <div className="form-grid-2col">
        {/* Colonne gauche */}
        <div className="form-column">
          <ClientSelector
            clients={clients}
            selectedClient={selectedClient}
            onSelect={onSelectClient}
            onAddClient={onAddClient}
          />
          <label>
            Service
            <input value={info.service} onChange={set('service')} placeholder="Ex: SERVICE DES ACHATS" />
          </label>
          <label>
            Objet
            <input value={info.objet} onChange={set('objet')} placeholder="Ex: travaux divers" />
          </label>
          <label>
            Localisation
            <input value={info.localisation} onChange={set('localisation')} placeholder="Ex: AWB AG CS" />
          </label>
        </div>
        
        {/* Colonne droite */}
        <div className="form-column">
          <label>
            Contact (A)
            <input value={info.contact} onChange={set('contact')} placeholder="Nom du contact" />
          </label>
          <label>
            BC N°
            <input value={info.bcNum} onChange={set('bcNum')} placeholder="N° bon de commande" />
          </label>
          <label>
            N° Devis
            <input value={info.reference} onChange={set('reference')} placeholder="Ex: 0001M/2026" />
          </label>
          <label>
            Date
            <input value={info.date} onChange={set('date')} placeholder="jj/mm/aaaa" />
          </label>
          <label>
            TVA (%)
            <input
              type="number"
              min={0}
              max={100}
              value={info.tva}
              onChange={set('tva')}
            />
          </label>
        </div>
      </div>
    </div>
  )
}
