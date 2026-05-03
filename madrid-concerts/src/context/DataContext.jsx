import { createContext, useContext, useState } from 'react'
import { getStoredEvents, getStoredVenues, saveEvents, saveVenues } from '../lib/store'

const Ctx = createContext()

export function DataProvider({ children }) {
  const [events, setEvents] = useState(getStoredEvents)
  const [venues, setVenues] = useState(getStoredVenues)

  function persist(setter, storeFn, next) { setter(next); storeFn(next) }

  const addEvent    = (d) => { const e = { ...d, id: `e${Date.now()}` }; persist(setEvents, saveEvents, [...events, e]); return e }
  const updateEvent = (id, d) => persist(setEvents, saveEvents, events.map(e => e.id === id ? { ...e, ...d } : e))
  const deleteEvent = (id)    => persist(setEvents, saveEvents, events.filter(e => e.id !== id))

  const addVenue    = (d) => { const v = { ...d, id: `v${Date.now()}` }; persist(setVenues, saveVenues, [...venues, v]); return v }
  const updateVenue = (id, d) => persist(setVenues, saveVenues, venues.map(v => v.id === id ? { ...v, ...d } : v))
  const deleteVenue = (id)    => persist(setVenues, saveVenues, venues.filter(v => v.id !== id))

  return (
    <Ctx.Provider value={{ events, venues, addEvent, updateEvent, deleteEvent, addVenue, updateVenue, deleteVenue }}>
      {children}
    </Ctx.Provider>
  )
}

export const useData = () => useContext(Ctx)
