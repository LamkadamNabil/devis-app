# 🧾 SOGERAY - Générateur de Devis

Application React pour générer des devis avec stockage Google Sheets.

## 📋 Fonctionnalités

- ✅ Création de devis avec numérotation automatique
- ✅ Gestion des clients et agences
- ✅ Regroupement des articles par agence
- ✅ Historique des devis avec statuts (En attente / Payé / Annulé)
- ✅ Impression PDF formatée SOGERAY
- ✅ Stockage Google Sheets (ou localStorage en mode hors ligne)

---

## 🚀 Installation

### 1. Cloner et installer les dépendances

```bash
cd devis-react
npm install
```

### 2. Lancer en développement

```bash
npm run dev
```

L'app fonctionne en **mode hors ligne** (localStorage) par défaut.

---

## 📊 Configuration Google Sheets (Optionnel)

Pour activer le stockage cloud gratuit:

### Étape 1: Créer la Google Sheet

1. Aller sur [Google Sheets](https://sheets.google.com)
2. Créer une nouvelle feuille
3. Créer 3 onglets (en bas): `clients`, `agences`, `devis`
4. Copier l'**ID de la feuille** depuis l'URL:
   ```
   https://docs.google.com/spreadsheets/d/[VOTRE_ID_ICI]/edit
   ```

### Étape 2: Déployer le Google Apps Script

1. Dans Google Sheets, aller sur **Extensions > Apps Script**
2. Supprimer le code existant
3. Coller le contenu de `google-apps-script/Code.gs`
4. Remplacer `VOTRE_SPREADSHEET_ID_ICI` par votre ID de feuille
5. Sauvegarder (Ctrl+S)
6. Exécuter la fonction `initializeSheets` une fois (menu Run > initializeSheets)
7. Aller sur **Déployer > Nouvelle déploiement**
8. Type: **Application Web**
9. Exécuter en tant que: **Moi**
10. Accès: **Tout le monde**
11. Cliquer **Déployer**
12. **Autoriser** l'accès à votre compte Google
13. Copier l'**URL du déploiement**

### Étape 3: Configurer l'app React

1. Créer un fichier `.env` à la racine du projet:

```bash
cp .env.example .env
```

2. Coller l'URL:

```env
VITE_GOOGLE_SHEETS_API_URL=https://script.google.com/macros/s/VOTRE_ID/exec
```

3. Relancer l'app:

```bash
npm run dev
```

L'indicateur passera de 🟡 à 🟢 "Connecté à Google Sheets"

---

## 🌐 Déploiement Gratuit

### Option A: Vercel (Recommandé)

```bash
npm install -g vercel
vercel
```

Ou connecter votre repo GitHub sur [vercel.com](https://vercel.com)

### Option B: Netlify

```bash
npm run build
# Glisser-déposer le dossier "dist" sur netlify.com/drop
```

### Option C: GitHub Pages

1. Dans `vite.config.js`, ajouter:
```js
export default defineConfig({
  base: '/nom-du-repo/',
  // ...
})
```

2. Build et déployer:
```bash
npm run build
# Push le dossier dist vers la branche gh-pages
```

---

## 🔧 Variables d'environnement

| Variable | Description |
|----------|-------------|
| `VITE_GOOGLE_SHEETS_API_URL` | URL du Google Apps Script déployé |

---

## 📁 Structure

```
devis-react/
├── src/
│   ├── components/     # Composants React
│   ├── data/           # Données JSON (catalogue)
│   ├── images/         # Logo, cachet
│   └── services/       # API Google Sheets
├── google-apps-script/ # Code backend
└── .env.example        # Template configuration
```

---

## 💾 Modes de stockage

| Mode | Stockage | Quand |
|------|----------|-------|
| Hors ligne | localStorage | Pas d'URL API configurée |
| Cloud | Google Sheets | URL API configurée |

Le mode hors ligne reste fonctionnel même si Google Sheets est configuré (fallback automatique en cas d'erreur).

---

## 📄 License

Projet interne SOGERAY
