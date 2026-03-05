import { useState, useEffect } from 'react'
import catalogue from './data/contrat_awb.json'
import initialClients from './data/clients.json'
import initialAgences from './data/agences.json'
import DevisHeader from './components/DevisHeader'
import SearchBar from './components/SearchBar'
import DevisTable from './components/DevisTable'
import DevisSummary from './components/DevisSummary'
import PrintView from './components/PrintView'
import DevisHistory from './components/DevisHistory'
import AgenceSelector from './components/AgenceSelector'
import LoginScreen from './components/LoginScreen'
import * as api from './services/googleSheetsService'
import './index.css'

// Generate devis reference number
const generateDevisNumber = (counter) => {
  const now = new Date()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const year = now.getFullYear()
  const num = String(counter).padStart(4, '0')
  return `${num}/${month}/${year}`
}

// Get current date in French format
const getCurrentDate = () => {
  return new Date().toLocaleDateString('fr-FR')
}

export default function App() {
  const [authenticated, setAuthenticated] = useState(
    () => sessionStorage.getItem('devis_auth') === 'true'
  )
  const [clients, setClients] = useState(initialClients)
  const [agences, setAgences] = useState(initialAgences)
  const [devisHistory, setDevisHistory] = useState([])
  const [devisCounter, setDevisCounter] = useState(1)
  const [loading, setLoading] = useState(true)
  const [apiStatus, setApiStatus] = useState({ configured: false, url: '' })

  const [selectedClient, setSelectedClient] = useState(null)
  const [selectedAgence, setSelectedAgence] = useState(null)
  const [activeTab, setActiveTab] = useState('nouveau')

  const [headerInfo, setHeaderInfo] = useState({
    service: '',
    objet: '',
    localisation: '',
    bcNum: '',
    reference: '',
    contact: '',
    date: getCurrentDate(),
    tva: 20,
  })

  const [lignes, setLignes] = useState([])
  const [printMode, setPrintMode] = useState(false)

  // Load data from Google Sheets (or localStorage fallback)
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        const [clientsData, agencesData, devisData, counter] = await Promise.all([
          api.getClients(),
          api.getAgences(),
          api.getDevis(),
          api.getDevisCounter()
        ])
        
        setClients(clientsData.length > 0 ? clientsData : initialClients)
        setAgences(agencesData.length > 0 ? agencesData : initialAgences)
        setDevisHistory(devisData)
        setDevisCounter(counter)
        setHeaderInfo(prev => ({ ...prev, reference: generateDevisNumber(counter) }))
        setApiStatus(api.getApiStatus())
      } catch (error) {
        console.error('Erreur chargement données:', error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const addClient = async (newClient) => {
    const client = { ...newClient, id: Date.now() }
    setClients(prev => [...prev, client])
    await api.addClient(client)
  }

  const addAgence = async (newAgence) => {
    const agence = { ...newAgence, id: Date.now() }
    setAgences(prev => [...prev, agence])
    await api.addAgence(agence)
  }

  const addLigne = (item) => {
    if (lignes.find((l) => l.CODE === item.CODE && l.agenceId === (selectedAgence?.id || null))) return
    setLignes((prev) => [
      ...prev,
      { 
        ...item, 
        quantite: 1,
        agenceId: selectedAgence?.id || null,
        agenceName: selectedAgence?.nom || 'Sans agence'
      },
    ])
  }

  const updateQuantite = (code, qty, agenceId = null) => {
    setLignes((prev) =>
      prev.map((l) => (l.CODE === code && l.agenceId === agenceId ? { ...l, quantite: Number(qty) } : l))
    )
  }

  const removeLigne = (code, agenceId = null) => {
    setLignes((prev) => prev.filter((l) => !(l.CODE === code && l.agenceId === agenceId)))
  }

  // Reset form for new devis
  const resetForm = () => {
    setHeaderInfo({
      service: '',
      objet: '',
      localisation: '',
      bcNum: '',
      reference: generateDevisNumber(devisCounter),
      contact: '',
      date: getCurrentDate(),
      tva: 20,
    })
    setSelectedClient(null)
    setSelectedAgence(null)
    setLignes([])
  }

  const moveUp = (idx) => {
    if (idx === 0) return
    const next = [...lignes]
    ;[next[idx - 1], next[idx]] = [next[idx], next[idx - 1]]
    setLignes(next)
  }

  const moveDown = (idx) => {
    if (idx === lignes.length - 1) return
    const next = [...lignes]
    ;[next[idx], next[idx + 1]] = [next[idx + 1], next[idx]]
    setLignes(next)
  }

  // Save current devis to history
  const saveDevis = async () => {
    if (lignes.length === 0 || !selectedClient) {
      alert('Veuillez sélectionner un client et ajouter des articles.')
      return
    }

    const totalHT = lignes.reduce((acc, l) => acc + Number(l.prix_actuel) * Number(l.quantite), 0)
    const montantTVA = totalHT * (Number(headerInfo.tva) / 100)
    const totalTTC = totalHT + montantTVA

    const newDevis = {
      id: Date.now(),
      reference: headerInfo.reference,
      date: headerInfo.date,
      client: selectedClient,
      headerInfo: { ...headerInfo },
      lignes: [...lignes],
      totalHT,
      totalTTC,
      statut: 'en_attente',
      createdAt: new Date().toISOString(),
    }

    // Update local state
    setDevisHistory((prev) => [newDevis, ...prev])
    
    // Save to Google Sheets (or localStorage)
    await api.addDevis(newDevis)
    
    // Increment counter
    const newCounter = devisCounter + 1
    setDevisCounter(newCounter)
    api.saveDevisCounter(newCounter)
    
    // Reset form
    setHeaderInfo({
      service: '',
      objet: '',
      localisation: '',
      bcNum: '',
      reference: generateDevisNumber(newCounter),
      contact: '',
      date: getCurrentDate(),
      tva: 20,
    })
    setSelectedClient(null)
    setSelectedAgence(null)
    setLignes([])
    
    alert(`Devis ${newDevis.reference} enregistré avec succès!`)
  }

  // Update devis status
  const updateDevisStatus = async (devisId, newStatus) => {
    setDevisHistory((prev) =>
      prev.map((d) => (d.id === devisId ? { ...d, statut: newStatus } : d))
    )
    await api.updateDevisStatus(devisId, newStatus)
  }

  // View a saved devis in print mode
  const viewDevis = (devis) => {
    setHeaderInfo(devis.headerInfo)
    setSelectedClient(devis.client)
    setLignes(devis.lignes)
    setPrintMode(true)
  }

  if (!authenticated) {
    return <LoginScreen onLogin={() => setAuthenticated(true)} />
  }

  if (loading) {
    return (
      <div className="app">
        <div className="loading-screen">
          <div className="loading-spinner"></div>
          <p>Chargement des données...</p>
        </div>
      </div>
    )
  }

  if (printMode) {
    return (
      <PrintView
        headerInfo={headerInfo}
        client={selectedClient}
        lignes={lignes}
        onClose={() => setPrintMode(false)}
      />
    )
  }

  return (
    <div className="app">
      <div className="app-header">
        <h1>📋 Générateur de Devis SOGERAY</h1>
        <div className="header-actions">
          <span className={`api-status ${apiStatus.configured ? 'online' : 'offline'}`}>
            {apiStatus.configured ? '🟢' : '🟡'} {apiStatus.url}
          </span>
          <button 
            className={`btn btn-tab ${activeTab === 'nouveau' ? 'active' : ''}`}
            onClick={() => setActiveTab('nouveau')}
          >
            + Nouveau Devis
          </button>
          <button 
            className={`btn btn-tab ${activeTab === 'historique' ? 'active' : ''}`}
            onClick={() => setActiveTab('historique')}
          >
            📋 Historique ({devisHistory.length})
          </button>
        </div>
      </div>

      {activeTab === 'nouveau' ? (
        <>
          <DevisHeader
            info={headerInfo}
            onChange={setHeaderInfo}
            clients={clients}
            selectedClient={selectedClient}
            onSelectClient={setSelectedClient}
            onAddClient={addClient}
          />

          <div className="agence-section">
            <AgenceSelector
              agences={agences}
              selectedAgence={selectedAgence}
              onSelect={setSelectedAgence}
              onAddAgence={addAgence}
            />
          </div>

          <SearchBar catalogue={catalogue} onAdd={addLigne} selected={lignes} />

          <DevisTable
            lignes={lignes}
            onQtyChange={updateQuantite}
            onRemove={removeLigne}
            onMoveUp={moveUp}
            onMoveDown={moveDown}
            tva={headerInfo.tva}
          />

          <DevisSummary lignes={lignes} tva={headerInfo.tva} />

          <div className="action-bar">
            <button 
              className="btn btn-reset" 
              onClick={resetForm}
            >
              🔄 Réinitialiser
            </button>
            <button 
              className="btn btn-save" 
              onClick={saveDevis}
              disabled={lignes.length === 0 || !selectedClient}
            >
              💾 Enregistrer le Devis
            </button>
            <button 
              className="btn btn-print" 
              onClick={() => setPrintMode(true)} 
              disabled={lignes.length === 0}
            >
              🖨️ Aperçu / Imprimer
            </button>
          </div>
        </>
      ) : (
        <DevisHistory
          devisList={devisHistory}
          onUpdateStatus={updateDevisStatus}
          onViewDevis={viewDevis}
        />
      )}
    </div>
  )
}
