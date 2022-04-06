
export type Entry<T> = {
  [K in keyof T]: [K, T[K]]
}[keyof T][]

export function entries<T>(ent: T) { 
  return Object.entries(ent) as Entry<T> 
}

export function keys <T>(obj: T) { 
  return Object.keys(obj) as (keyof T)[]
}

