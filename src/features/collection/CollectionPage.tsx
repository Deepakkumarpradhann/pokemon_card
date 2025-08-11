import { useMemo, useRef, useState } from 'react'
import { useCollection } from './collectionContext'
import { getBasicStat, getPokemonImage } from '../api/pokeapi'

type DragState = {
  draggingIndex: number | null
  overIndex: number | null
}

export function CollectionPage() {
  const { items, moveItem, removeAt } = useCollection()
  const [drag, setDrag] = useState<DragState>({ draggingIndex: null, overIndex: null })
  const refs = useRef<(HTMLDivElement | null)[]>([])

  const handleDragStart = (index: number) => (e: React.DragEvent) => {
    setDrag({ draggingIndex: index, overIndex: index })
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', String(index))
  }

  const handleDragOver = (index: number) => (e: React.DragEvent) => {
    e.preventDefault()
    setDrag((d) => ({ ...d, overIndex: index }))
  }

  const handleDrop = (index: number) => (e: React.DragEvent) => {
    e.preventDefault()
    const from = Number(e.dataTransfer.getData('text/plain'))
    const to = index
    if (Number.isFinite(from) && Number.isFinite(to)) moveItem(from, to)
    setDrag({ draggingIndex: null, overIndex: null })
  }

  const handleDragEnd = () => setDrag({ draggingIndex: null, overIndex: null })

  const visualItems = useMemo(() => items, [items])

  return (
    <div className="collection-list">
      {visualItems.length === 0 && (
        <div style={{ color: '#94a3b8' }}>Your collection is empty. Add Pokemon from Discover.</div>
      )}
      {visualItems.map((p, i) => (
        <div
          key={p.id}
          ref={(el) => (refs.current[i] = el)}
          className="collection-item"
          draggable
          onDragStart={handleDragStart(i)}
          onDragOver={handleDragOver(i)}
          onDrop={handleDrop(i)}
          onDragEnd={handleDragEnd}
          style={{
            outline: drag.overIndex === i ? '2px solid #22c55e' : 'none',
            background: drag.draggingIndex === i ? '#0b1220' : undefined,
          }}
        >
          <div className="row" style={{ gap: 12 }}>
            <img src={getPokemonImage(p)} alt={p.name} width={48} height={48} />
            <div>
              <div style={{ textTransform: 'capitalize', fontWeight: 600 }}>{p.name}</div>
              <div className="types">
                {p.types.map((t) => (
                  <span className="pill" key={t.type.name}>{t.type.name}</span>
                ))}
              </div>
            </div>
          </div>
          <div className="row">
            <div className="row" style={{ gap: 8 }}>
              <div className="stat"><small>HP</small><div>{getBasicStat(p, 'hp') ?? '-'}</div></div>
              <div className="stat"><small>ATK</small><div>{getBasicStat(p, 'attack') ?? '-'}</div></div>
              <div className="stat"><small>DEF</small><div>{getBasicStat(p, 'defense') ?? '-'}</div></div>
            </div>
            <div className="drag-handle">↕</div>
            <button className="add-btn" onClick={() => removeAt(i)}>Remove</button>
          </div>
        </div>
      ))}
    </div>
  )
}


