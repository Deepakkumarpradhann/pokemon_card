export type PokemonListResult = {
  name: string
  url: string
}

export type PokemonListResponse = {
  count: number
  next: string | null
  previous: string | null
  results: PokemonListResult[]
}

export type PokemonType = { slot: number; type: { name: string; url: string } }
export type PokemonStat = { base_stat: number; stat: { name: string } }

export type Pokemon = {
  id: number
  name: string
  sprites: { other?: { [key: string]: { front_default?: string } }; front_default?: string }
  types: PokemonType[]
  stats: PokemonStat[]
}

const API = 'https://pokeapi.co/api/v2'

export async function fetchPokemonPage(limit: number, offset: number): Promise<PokemonListResponse> {
  const res = await fetch(`${API}/pokemon?limit=${limit}&offset=${offset}`)
  if (!res.ok) throw new Error('Failed to fetch pokemon list')
  return res.json()
}

export async function fetchPokemonByName(name: string): Promise<Pokemon> {
  const res = await fetch(`${API}/pokemon/${name}`)
  if (!res.ok) throw new Error('Failed to fetch pokemon')
  return res.json()
}

export function getPokemonImage(p: Pokemon): string | undefined {
  return (
    p.sprites.other?.['official-artwork']?.front_default ||
    p.sprites.other?.['dream_world']?.front_default ||
    p.sprites.front_default
  )
}

export function getBasicStat(pokemon: Pokemon, key: 'hp' | 'attack' | 'defense'): number | undefined {
  const stat = pokemon.stats.find((s) => s.stat.name === key)
  return stat?.base_stat
}


