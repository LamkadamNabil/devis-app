// ============================================
// GOOGLE APPS SCRIPT - Backend pour Devis App
// ============================================
// Instructions:
// 1. Créer une nouvelle Google Sheet avec 3 onglets: "clients", "agences", "devis"
// 2. Aller sur Extensions > Apps Script
// 3. Coller ce code et sauvegarder
// 4. Déployer > Nouvelle déploiement > Application Web
// 5. Accès: "Tout le monde" > Déployer
// 6. Copier l'URL du déploiement dans votre app React

const SPREADSHEET_ID = 'VOTRE_SPREADSHEET_ID_ICI'; // Remplacer par votre ID

// Headers pour chaque feuille
const HEADERS = {
  clients: ['id', 'nom', 'adresse', 'ice', 'createdAt'],
  agences: ['id', 'nom', 'createdAt'],
  devis: ['id', 'reference', 'date', 'clientId', 'clientNom', 'headerInfo', 'lignes', 'totalHT', 'totalTTC', 'statut', 'createdAt']
};

// ============================================
// FONCTIONS UTILITAIRES
// ============================================

function getSheet(sheetName) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = ss.getSheetByName(sheetName);
  
  // Créer la feuille si elle n'existe pas
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    sheet.appendRow(HEADERS[sheetName]);
  }
  
  return sheet;
}

function sheetToJson(sheetName) {
  const sheet = getSheet(sheetName);
  const data = sheet.getDataRange().getValues();
  
  if (data.length <= 1) return [];
  
  const headers = data[0];
  const rows = data.slice(1);
  
  return rows.map(row => {
    const obj = {};
    headers.forEach((header, idx) => {
      let value = row[idx];
      // Parse JSON strings for complex fields
      if ((header === 'headerInfo' || header === 'lignes') && typeof value === 'string' && value) {
        try {
          value = JSON.parse(value);
        } catch (e) {}
      }
      obj[header] = value;
    });
    return obj;
  });
}

function addRow(sheetName, data) {
  const sheet = getSheet(sheetName);
  const headers = HEADERS[sheetName];
  
  const row = headers.map(header => {
    let value = data[header];
    // Stringify complex objects
    if (typeof value === 'object' && value !== null) {
      value = JSON.stringify(value);
    }
    return value || '';
  });
  
  sheet.appendRow(row);
  return data;
}

function updateRow(sheetName, id, data) {
  const sheet = getSheet(sheetName);
  const allData = sheet.getDataRange().getValues();
  const headers = allData[0];
  const idColIndex = headers.indexOf('id');
  
  for (let i = 1; i < allData.length; i++) {
    if (String(allData[i][idColIndex]) === String(id)) {
      headers.forEach((header, idx) => {
        if (data.hasOwnProperty(header)) {
          let value = data[header];
          if (typeof value === 'object' && value !== null) {
            value = JSON.stringify(value);
          }
          sheet.getRange(i + 1, idx + 1).setValue(value);
        }
      });
      return { success: true, id: id };
    }
  }
  return { success: false, error: 'Not found' };
}

function deleteRow(sheetName, id) {
  const sheet = getSheet(sheetName);
  const allData = sheet.getDataRange().getValues();
  const headers = allData[0];
  const idColIndex = headers.indexOf('id');
  
  for (let i = 1; i < allData.length; i++) {
    if (String(allData[i][idColIndex]) === String(id)) {
      sheet.deleteRow(i + 1);
      return { success: true };
    }
  }
  return { success: false, error: 'Not found' };
}

// ============================================
// API ENDPOINTS
// ============================================

function doGet(e) {
  const params = e.parameter;
  const action = params.action;
  const sheet = params.sheet;
  
  let result;
  
  try {
    switch (action) {
      case 'getAll':
        result = sheetToJson(sheet);
        break;
      case 'getCounter':
        const devisData = sheetToJson('devis');
        result = { counter: devisData.length + 1 };
        break;
      default:
        result = { error: 'Unknown action' };
    }
  } catch (error) {
    result = { error: error.toString() };
  }
  
  return ContentService
    .createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  const params = JSON.parse(e.postData.contents);
  const action = params.action;
  const sheet = params.sheet;
  const data = params.data;
  const id = params.id;
  
  let result;
  
  try {
    switch (action) {
      case 'add':
        result = addRow(sheet, data);
        break;
      case 'update':
        result = updateRow(sheet, id, data);
        break;
      case 'delete':
        result = deleteRow(sheet, id);
        break;
      default:
        result = { error: 'Unknown action' };
    }
  } catch (error) {
    result = { error: error.toString() };
  }
  
  return ContentService
    .createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

// ============================================
// FONCTION D'INITIALISATION (à exécuter une fois)
// ============================================

function initializeSheets() {
  // Créer les feuilles avec les headers
  Object.keys(HEADERS).forEach(sheetName => {
    getSheet(sheetName);
  });
  
  Logger.log('Feuilles initialisées avec succès!');
}
