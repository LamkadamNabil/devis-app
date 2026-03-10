// ============================================
// GOOGLE APPS SCRIPT - Backend pour Devis App
// ============================================
// IMPORTANT - Paramètres de déploiement (Web App):
//   → Exécuter en tant que : MOI (votre compte Google)   ← OBLIGATOIRE
//   → Qui a accès          : Tout le monde
//
// Étapes:
// 1. Coller ce code dans l'éditeur Apps Script
// 2. Exécuter initializeSheets() manuellement (Run > initializeSheets)
//    et accepter les autorisations demandées
// 3. Déployer > Nouvelle déploiement > Application Web
//    → Exécuter en tant que : Moi
//    → Accès : Tout le monde
// 4. Copier l'URL /exec dans le fichier .env de React

const SPREADSHEET_ID = '18s0RKPDNMNQNPs8Cmal1NhYcWWTTbiOHIT-K8qQvaNg';

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
  return ss.getSheetByName(sheetName);
}

function sheetToJson(sheetName) {
  const sheet = getSheet(sheetName);
  if (!sheet) return [];
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];
  const headers = data[0];
  return data.slice(1).map(row => {
    const obj = {};
    headers.forEach((h, i) => {
      let v = row[i];
      if ((h === 'headerInfo' || h === 'lignes') && typeof v === 'string' && v) {
        try { v = JSON.parse(v); } catch(e) {}
      }
      obj[h] = v;
    });
    return obj;
  });
}

function addRow(sheetName, data) {
  const sheet = getSheet(sheetName);
  if (!sheet) throw new Error('Sheet not found: ' + sheetName);
  const headers = HEADERS[sheetName];
  const row = headers.map(h => {
    let v = data[h];
    if (typeof v === 'object' && v !== null) v = JSON.stringify(v);
    return v !== undefined && v !== null ? v : '';
  });
  sheet.appendRow(row);
  return data;
}

function updateRow(sheetName, id, data) {
  const sheet = getSheet(sheetName);
  if (!sheet) throw new Error('Sheet not found: ' + sheetName);
  const all = sheet.getDataRange().getValues();
  const idIdx = all[0].indexOf('id');
  for (let i = 1; i < all.length; i++) {
    if (String(all[i][idIdx]) === String(id)) {
      all[0].forEach((h, idx) => {
        if (data[h] !== undefined) {
          let v = data[h];
          if (typeof v === 'object') v = JSON.stringify(v);
          sheet.getRange(i + 1, idx + 1).setValue(v);
        }
      });
      return { success: true };
    }
  }
  return { success: false, error: 'Not found' };
}

function deleteRow(sheetName, id) {
  const sheet = getSheet(sheetName);
  if (!sheet) throw new Error('Sheet not found: ' + sheetName);
  const all = sheet.getDataRange().getValues();
  const idIdx = all[0].indexOf('id');
  for (let i = 1; i < all.length; i++) {
    if (String(all[i][idIdx]) === String(id)) {
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
  const params = (e && e.parameter) ? e.parameter : {};
  const action = params.action;
  const sheet = params.sheet;
  let result;

  try {
    if (action === 'getAll') {
      result = sheetToJson(sheet);
    } else if (action === 'getCounter') {
      result = { counter: sheetToJson('devis').length + 1 };
    } else if (action === 'health') {
      result = { status: 'ok', spreadsheetId: SPREADSHEET_ID };
    } else {
      result = { error: 'Unknown action: ' + action };
    }
  } catch(err) {
    result = { error: err.toString() };
  }

  return ContentService
    .createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  let params;
  try {
    params = JSON.parse(e.postData.contents);
  } catch(err) {
    return ContentService
      .createTextOutput(JSON.stringify({ error: 'Invalid JSON body' }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  const { action, sheet, data, id } = params;
  let result;

  try {
    if (action === 'add') {
      result = addRow(sheet, data);
    } else if (action === 'update') {
      result = updateRow(sheet, id, data);
    } else if (action === 'delete') {
      result = deleteRow(sheet, id);
    } else {
      result = { error: 'Unknown action: ' + action };
    }
  } catch(err) {
    result = { error: err.toString() };
  }

  return ContentService
    .createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

// ============================================
// INITIALISATION (exécuter UNE FOIS manuellement)
// ============================================

function initializeSheets() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  Object.keys(HEADERS).forEach(name => {
    let sheet = ss.getSheetByName(name);
    if (!sheet) {
      sheet = ss.insertSheet(name);
    }
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(HEADERS[name]);
    }
    Logger.log('Feuille ' + name + ' OK');
  });
  Logger.log('Initialisation terminée!');
}
