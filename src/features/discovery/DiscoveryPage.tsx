import { useMemo, useRef } from 'react'
import { useInfiniteQuery, useQueries } from '@tanstack/react-query'
import { fetchPokemonByName, fetchPokemonPage, getBasicStat, getPokemonImage, Pokemon } from '../api/pokeapi'
import { useCollection } from '../collection/collectionContext'

const PAGE_SIZE = 6

export function DiscoveryPage() {
  const { addToCollection } = useCollection()
  const sentinelRef = useRef<HTMLDivElement | null>(null)

  const {
    data,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    status,
  } = useInfiniteQuery({
    queryKey: ['pokemon-list'] as const,
    queryFn: async ({ pageParam }) => {
      const offset = (pageParam ?? 0) as number
      return fetchPokemonPage(PAGE_SIZE, offset)
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage.next) return undefined
      return allPages.length * PAGE_SIZE
    },
  })

  // Flatten names from pages
  const names = useMemo(
    () => data?.pages.flatMap((p) => p.results.map((r) => r.name)) ?? [],
    [data]
  )

  // Fetch detailed info for every name in parallel (batched queries)
  const detailQueries = useQueries({
    queries: names.map((name) => ({
      queryKey: ['pokemon', name] as const,
      queryFn: () => fetchPokemonByName(name),
      staleTime: 60_000,
    })),
  })

  // Intersection Observer to trigger fetching next page
  useIntersectionObserver(sentinelRef, () => {
    if (!isFetchingNextPage && hasNextPage) fetchNextPage()
  })

  const pokemons: Pokemon[] = detailQueries
    .map((q) => (q.data as Pokemon | undefined))
    .filter(Boolean) as Pokemon[]

  return (
    <div className="grid">
      {status === 'pending' && Array.from({ length: PAGE_SIZE }).map((_, i) => (
        <div className="skeleton" key={`s-${i}`} />
      ))}

      {pokemons.map((p) => (
        <div className="card" key={p.id}>
          <div className="card-header">
            <strong style={{ textTransform: 'capitalize' }}>{p.name}</strong>
            <button className="add-btn" onClick={() => addToCollection(p)}>+ Add</button>
          </div>
          <div className="img-wrap">
            {getPokemonImage(p) ? (
              <img src={getPokemonImage(p)} alt={p.name} />
            ) : (
              <div style={{ color: '#94a3b8' }}>No image</div>
            )}
          </div>
          <div style={{ padding: 12 }}>
            <div className="types">
              {p.types.map((t) => (
                <span className="pill" key={t.type.name}>{t.type.name}</span>
              ))}
            </div>
          </div>
          <div className="stats">
            <div className="stat"><small>HP</small><div>{getBasicStat(p, 'hp') ?? '-'}</div></div>
            <div className="stat"><small>ATK</small><div>{getBasicStat(p, 'attack') ?? '-'}</div></div>
            <div className="stat"><small>DEF</small><div>{getBasicStat(p, 'defense') ?? '-'}</div></div>
          </div>
        </div>
      ))}

      {/* Sentinel for infinite scroll */}
      <div ref={sentinelRef} style={{ height: 1 }} />
      {isFetchingNextPage && Array.from({ length: PAGE_SIZE }).map((_, i) => (
        <div className="skeleton" key={`l-${i}`} />
      ))}
    </div>
  )
}

function useIntersectionObserver(
  ref: React.RefObject<Element>,
  onIntersect: () => void,
  options: IntersectionObserverInit = { root: null, rootMargin: '0px', threshold: 1 }
) {
  const savedCallback = useRef(onIntersect)
  savedCallback.current = onIntersect

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useMemo(() => {
    const node = ref.current
    if (!node) return

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) savedCallback.current()
    }, options)

    observer.observe(node)
    return () => observer.disconnect()
  }, [ref.current, options.root, options.rootMargin, options.threshold])
}


