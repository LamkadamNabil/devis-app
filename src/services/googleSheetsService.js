// ============================================
// Service Google Sheets API
// ============================================

// URL du déploiement Google Apps Script
// À remplacer après déploiement
const API_URL = import.meta.env.VITE_GOOGLE_SHEETS_API_URL || '';

// Mode hors ligne (utilise localStorage si API non configurée)
const isOfflineMode = () => !API_URL;

// ============================================
// CLIENTS
// ============================================

export async function getClients() {
  if (isOfflineMode()) {
    const saved = localStorage.getItem('devis_app_clients');
    return saved ? JSON.parse(saved) : [];
  }
  
  try {
    const response = await fetch(`${API_URL}?action=getAll&sheet=clients`);
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Erreur getClients:', error);
    // Fallback to localStorage
    const saved = localStorage.getItem('devis_app_clients');
    return saved ? JSON.parse(saved) : [];
  }
}

export async function addClient(client) {
  const newClient = {
    ...client,
    id: client.id || Date.now(),
    createdAt: new Date().toISOString()
  };
  
  if (isOfflineMode()) {
    const clients = await getClients();
    clients.push(newClient);
    localStorage.setItem('devis_app_clients', JSON.stringify(clients));
    return newClient;
  }
  
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      body: JSON.stringify({
        action: 'add',
        sheet: 'clients',
        data: newClient
      })
    });
    return await response.json();
  } catch (error) {
    console.error('Erreur addClient:', error);
    // Fallback to localStorage
    const clients = await getClients();
    clients.push(newClient);
    localStorage.setItem('devis_app_clients', JSON.stringify(clients));
    return newClient;
  }
}

// ============================================
// AGENCES
// ============================================

export async function getAgences() {
  if (isOfflineMode()) {
    const saved = localStorage.getItem('devis_app_agences');
    return saved ? JSON.parse(saved) : [];
  }
  
  try {
    const response = await fetch(`${API_URL}?action=getAll&sheet=agences`);
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Erreur getAgences:', error);
    const saved = localStorage.getItem('devis_app_agences');
    return saved ? JSON.parse(saved) : [];
  }
}

export async function addAgence(agence) {
  const newAgence = {
    ...agence,
    id: agence.id || Date.now(),
    createdAt: new Date().toISOString()
  };
  
  if (isOfflineMode()) {
    const agences = await getAgences();
    agences.push(newAgence);
    localStorage.setItem('devis_app_agences', JSON.stringify(agences));
    return newAgence;
  }
  
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      body: JSON.stringify({
        action: 'add',
        sheet: 'agences',
        data: newAgence
      })
    });
    return await response.json();
  } catch (error) {
    console.error('Erreur addAgence:', error);
    const agences = await getAgences();
    agences.push(newAgence);
    localStorage.setItem('devis_app_agences', JSON.stringify(agences));
    return newAgence;
  }
}

// ============================================
// DEVIS
// ============================================

export async function getDevis() {
  if (isOfflineMode()) {
    const saved = localStorage.getItem('devis_app_history');
    return saved ? JSON.parse(saved) : [];
  }
  
  try {
    const response = await fetch(`${API_URL}?action=getAll&sheet=devis`);
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Erreur getDevis:', error);
    const saved = localStorage.getItem('devis_app_history');
    return saved ? JSON.parse(saved) : [];
  }
}

export async function addDevis(devis) {
  const newDevis = {
    ...devis,
    id: devis.id || Date.now(),
    createdAt: new Date().toISOString()
  };
  
  if (isOfflineMode()) {
    const devisList = await getDevis();
    devisList.unshift(newDevis);
    localStorage.setItem('devis_app_history', JSON.stringify(devisList));
    return newDevis;
  }
  
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      body: JSON.stringify({
        action: 'add',
        sheet: 'devis',
        data: {
          ...newDevis,
          clientId: newDevis.client?.id,
          clientNom: newDevis.client?.nom,
          headerInfo: newDevis.headerInfo,
          lignes: newDevis.lignes
        }
      })
    });
    return await response.json();
  } catch (error) {
    console.error('Erreur addDevis:', error);
    const devisList = await getDevis();
    devisList.unshift(newDevis);
    localStorage.setItem('devis_app_history', JSON.stringify(devisList));
    return newDevis;
  }
}

export async function updateDevisStatus(devisId, newStatus) {
  if (isOfflineMode()) {
    const devisList = await getDevis();
    const updated = devisList.map(d => 
      d.id === devisId ? { ...d, statut: newStatus } : d
    );
    localStorage.setItem('devis_app_history', JSON.stringify(updated));
    return { success: true };
  }
  
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      body: JSON.stringify({
        action: 'update',
        sheet: 'devis',
        id: devisId,
        data: { statut: newStatus }
      })
    });
    return await response.json();
  } catch (error) {
    console.error('Erreur updateDevisStatus:', error);
    const devisList = await getDevis();
    const updated = devisList.map(d => 
      d.id === devisId ? { ...d, statut: newStatus } : d
    );
    localStorage.setItem('devis_app_history', JSON.stringify(updated));
    return { success: true };
  }
}

export async function getDevisCounter() {
  if (isOfflineMode()) {
    const saved = localStorage.getItem('devis_app_counter');
    return saved ? parseInt(saved, 10) : 1;
  }
  
  try {
    const response = await fetch(`${API_URL}?action=getCounter`);
    const data = await response.json();
    return data.counter || 1;
  } catch (error) {
    console.error('Erreur getDevisCounter:', error);
    const saved = localStorage.getItem('devis_app_counter');
    return saved ? parseInt(saved, 10) : 1;
  }
}

export function saveDevisCounter(counter) {
  localStorage.setItem('devis_app_counter', String(counter));
}

// ============================================
// SYNC STATUS
// ============================================

export function getApiStatus() {
  return {
    configured: !isOfflineMode(),
    url: API_URL ? 'Connecté à Google Sheets' : 'Mode hors ligne (localStorage)'
  };
}
