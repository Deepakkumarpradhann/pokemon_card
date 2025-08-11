import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react'
import type { Pokemon } from '../api/pokeapi'

type CollectionItem = Pokemon

type CollectionContextValue = {
  items: CollectionItem[]
  addToCollection: (pokemon: Pokemon) => void
  moveItem: (fromIndex: number, toIndex: number) => void
  removeAt: (index: number) => void
}

const CollectionContext = createContext<CollectionContextValue | undefined>(undefined)

const STORAGE_KEY = 'my_pokemon_collection_v1'

export function CollectionProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CollectionItem[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      return raw ? (JSON.parse(raw) as CollectionItem[]) : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  }, [items])

  const value = useMemo<CollectionContextValue>(() => ({
    items,
    addToCollection: (pokemon) => {
      setItems((prev) => {
        if (prev.some((p) => p.id === pokemon.id)) return prev
        return [...prev, pokemon]
      })
    },
    moveItem: (from, to) => {
      setItems((prev) => {
        if (from === to || from < 0 || to < 0 || from >= prev.length || to >= prev.length) return prev
        const copy = prev.slice()
        const [spliced] = copy.splice(from, 1)
        copy.splice(to, 0, spliced)
        return copy
      })
    },
    removeAt: (index) => {
      setItems((prev) => prev.filter((_, i) => i !== index))
    },
  }), [items])

  return <CollectionContext.Provider value={value}>{children}</CollectionContext.Provider>
}

export function useCollection() {
  const ctx = useContext(CollectionContext)
  if (!ctx) throw new Error('useCollection must be used within CollectionProvider')
  return ctx
}


