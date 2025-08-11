import { useState } from 'react'
import { DiscoveryPage } from './features/discovery/DiscoveryPage'
import { CollectionPage } from './features/collection/CollectionPage'
import { CollectionProvider } from './features/collection/collectionContext'

export function App() {
  const [tab, setTab] = useState<'discover' | 'collection'>('discover')

  return (
    <CollectionProvider>
      <div className="app">
        <header className="app-header">
          <h1>Pokemon Discovery</h1>
          <nav className="tabs">
            <button
              className={tab === 'discover' ? 'active' : ''}
              onClick={() => setTab('discover')}
            >
              Discover
            </button>
            <button
              className={tab === 'collection' ? 'active' : ''}
              onClick={() => setTab('collection')}
            >
              My Collection
            </button>
          </nav>
        </header>
        <main className="app-main">
          {tab === 'discover' ? <DiscoveryPage /> : <CollectionPage />}
        </main>
      </div>
    </CollectionProvider>
  )
}


