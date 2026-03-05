import { useState, useRef, useEffect } from 'react'

export default function SearchBar({ catalogue, onAdd, selected }) {
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleInput = (val) => {
    setQuery(val)
    if (!val.trim()) {
      setSuggestions([])
      setOpen(false)
      return
    }
    const q = val.toLowerCase()
    const results = catalogue.filter(
      (item) =>
        String(item.CODE).includes(q) ||
        (item.designation || '').toLowerCase().includes(q)
    ).slice(0, 12)
    setSuggestions(results)
    setOpen(results.length > 0)
  }

  const handleSelect = (item) => {
    onAdd(item)
    setQuery('')
    setSuggestions([])
    setOpen(false)
  }

  const isSelected = (code) => selected.some((l) => l.CODE === code)

  return (
    <div className="card search-section" ref={ref}>
      <h2>Ajouter des articles</h2>
      <div className="search-wrap">
        <input
          className="search-input"
          type="text"
          value={query}
          onChange={(e) => handleInput(e.target.value)}
          placeholder="Rechercher par code ou désignation…"
          onFocus={() => query && setOpen(suggestions.length > 0)}
        />
        {query && (
          <button className="clear-btn" onClick={() => { setQuery(''); setOpen(false) }}>✕</button>
        )}
      </div>

      {open && (
        <ul className="suggestions">
          {suggestions.map((item) => (
            <li
              key={item.CODE}
              className={`suggestion-item ${isSelected(item.CODE) ? 'already-added' : ''}`}
              onClick={() => !isSelected(item.CODE) && handleSelect(item)}
            >
              <div className="sug-left">
                <span className="sug-code">{Number(item.CODE).toFixed(0)}</span>
                <span className="sug-label">{item.designation}</span>
              </div>
              <div className="sug-right">
                <span className="sug-unit">{item.unite}</span>
                <span className="sug-price">{Number(item.prix_actuel).toLocaleString('fr-FR')} DH</span>
                {isSelected(item.CODE)
                  ? <span className="badge-added">✓ Ajouté</span>
                  : <button className="btn btn-add-small">+ Ajouter</button>
                }
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
