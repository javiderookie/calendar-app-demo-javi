import { useState } from 'react'
import { useData } from '../context/DataContext'

const PASS = import.meta.env.VITE_ADMIN_PASSWORD || 'madrid2024'
const SESSION_KEY = 'mc_admin_ok'

/* ── helpers ── */
const emptyEvent = () => ({
  title: '', artist: '', venue_id: '', date: '', time: '21:00',
  price: '', genre: '', description: '', image: ''
})
const emptyVenue = () => ({
  name: '', address: '', neighborhood: '', capacity: '',
  website: '', description: '', image: ''
})

/* ── tiny shared input styles ── */
const inp  = 'w-full bg-zinc-900 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-zinc-500 placeholder-zinc-600'
const lbl  = 'block text-xs font-semibold text-zinc-400 mb-1'

function Field({ label, error, children }) {
  return (
    <div>
      <label className={lbl}>{label}</label>
      {children}
      {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
    </div>
  )
}

/* ── Modal wrapper ── */
function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-start justify-center p-4 overflow-y-auto"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-xl my-8">
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
          <h2 className="text-white font-bold text-base">{title}</h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-white text-xl leading-none">×</button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}

/* ── Event form ── */
function EventForm({ initial, venues, onSave, onClose }) {
  const [form, setForm] = useState(initial)
  const [errors, setErrors] = useState({})

  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setErrors(e => ({ ...e, [k]: '' })) }

  function validate() {
    const e = {}
    if (!form.title.trim())       e.title       = 'Requerido'
    if (!form.artist.trim())      e.artist      = 'Requerido'
    if (!form.venue_id)           e.venue_id    = 'Selecciona una sala'
    if (!form.date)               e.date        = 'Requerido'
    if (!form.time)               e.time        = 'Requerido'
    if (form.price === '')        e.price       = 'Requerido'
    if (!form.genre.trim())       e.genre       = 'Requerido'
    if (!form.description.trim()) e.description = 'Requerido'
    return e
  }

  function submit(ev) {
    ev.preventDefault()
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }
    onSave({ ...form, price: Number(form.price), capacity: Number(form.capacity) })
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Field label="Título *" error={errors.title}>
          <input className={inp} value={form.title} onChange={e => set('title', e.target.value)} placeholder="Ej: Vetusta Morla en Madrid" />
        </Field>
        <Field label="Artista *" error={errors.artist}>
          <input className={inp} value={form.artist} onChange={e => set('artist', e.target.value)} placeholder="Nombre del artista" />
        </Field>
      </div>

      <Field label="Sala *" error={errors.venue_id}>
        <select className={inp} value={form.venue_id} onChange={e => set('venue_id', e.target.value)}>
          <option value="">Selecciona una sala</option>
          {venues.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
        </select>
      </Field>

      <div className="grid grid-cols-3 gap-4">
        <Field label="Fecha *" error={errors.date}>
          <input className={inp} type="date" value={form.date} onChange={e => set('date', e.target.value)} />
        </Field>
        <Field label="Hora *" error={errors.time}>
          <input className={inp} type="time" value={form.time} onChange={e => set('time', e.target.value)} />
        </Field>
        <Field label="Precio (€) *" error={errors.price}>
          <input className={inp} type="number" min="0" value={form.price} onChange={e => set('price', e.target.value)} placeholder="0 = Gratis" />
        </Field>
      </div>

      <Field label="Género *" error={errors.genre}>
        <input className={inp} list="genres-list" value={form.genre} onChange={e => set('genre', e.target.value)} placeholder="Indie Rock, Jazz, Pop…" />
        <datalist id="genres-list">
          {['Indie Rock','Pop','Rock','Jazz','Pop Latino','Urban / Pop','Indie Pop','Rock / Cantautor','Flamenco','Electronic'].map(g =>
            <option key={g} value={g} />)}
        </datalist>
      </Field>

      <Field label="Descripción *" error={errors.description}>
        <textarea className={inp} rows={3} value={form.description} onChange={e => set('description', e.target.value)} placeholder="Descripción del evento…" />
      </Field>

      <Field label="URL de imagen (opcional)">
        <input className={inp} type="url" value={form.image} onChange={e => set('image', e.target.value)} placeholder="https://…" />
        {form.image && <img src={form.image} alt="" className="mt-2 h-20 w-full object-cover rounded-lg opacity-70" onError={e => e.target.style.display='none'} />}
      </Field>

      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-zinc-400 hover:text-white transition-colors">Cancelar</button>
        <button type="submit" className="px-5 py-2 bg-c-red hover:bg-red-700 text-white text-sm font-bold rounded-lg transition-colors">Guardar evento</button>
      </div>
    </form>
  )
}

/* ── Venue form ── */
function VenueForm({ initial, onSave, onClose }) {
  const [form, setForm] = useState(initial)
  const [errors, setErrors] = useState({})

  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setErrors(e => ({ ...e, [k]: '' })) }

  function validate() {
    const e = {}
    if (!form.name.trim())         e.name         = 'Requerido'
    if (!form.address.trim())      e.address      = 'Requerido'
    if (!form.neighborhood.trim()) e.neighborhood = 'Requerido'
    if (!form.capacity)            e.capacity     = 'Requerido'
    if (!form.description.trim())  e.description  = 'Requerido'
    return e
  }

  function submit(ev) {
    ev.preventDefault()
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }
    onSave({ ...form, capacity: Number(form.capacity) })
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Field label="Nombre *" error={errors.name}>
          <input className={inp} value={form.name} onChange={e => set('name', e.target.value)} placeholder="Nombre de la sala" />
        </Field>
        <Field label="Barrio *" error={errors.neighborhood}>
          <input className={inp} value={form.neighborhood} onChange={e => set('neighborhood', e.target.value)} placeholder="Malasaña, Chamberí…" />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Dirección *" error={errors.address}>
          <input className={inp} value={form.address} onChange={e => set('address', e.target.value)} placeholder="C/ Ejemplo, 10" />
        </Field>
        <Field label="Aforo *" error={errors.capacity}>
          <input className={inp} type="number" min="1" value={form.capacity} onChange={e => set('capacity', e.target.value)} placeholder="500" />
        </Field>
      </div>

      <Field label="Descripción *" error={errors.description}>
        <textarea className={inp} rows={3} value={form.description} onChange={e => set('description', e.target.value)} placeholder="Descripción de la sala…" />
      </Field>

      <Field label="Web (opcional)">
        <input className={inp} type="url" value={form.website} onChange={e => set('website', e.target.value)} placeholder="https://…" />
      </Field>

      <Field label="URL de imagen (opcional)">
        <input className={inp} type="url" value={form.image} onChange={e => set('image', e.target.value)} placeholder="https://…" />
        {form.image && <img src={form.image} alt="" className="mt-2 h-20 w-full object-cover rounded-lg opacity-70" onError={e => e.target.style.display='none'} />}
      </Field>

      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-zinc-400 hover:text-white transition-colors">Cancelar</button>
        <button type="submit" className="px-5 py-2 bg-c-red hover:bg-red-700 text-white text-sm font-bold rounded-lg transition-colors">Guardar sala</button>
      </div>
    </form>
  )
}

/* ── Main Admin Page ── */
export default function Admin() {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem(SESSION_KEY) === '1')
  const [pwInput, setPwInput] = useState('')
  const [pwError, setPwError] = useState(false)

  const [tab, setTab]           = useState('events')
  const [eventModal, setEventModal] = useState(null) // null | 'new' | event-object
  const [venueModal, setVenueModal] = useState(null)

  const { events, venues, addEvent, updateEvent, deleteEvent, addVenue, updateVenue, deleteVenue } = useData()
  const venueMap = Object.fromEntries(venues.map(v => [v.id, v]))

  function login(e) {
    e.preventDefault()
    if (pwInput === PASS) { sessionStorage.setItem(SESSION_KEY, '1'); setAuthed(true) }
    else { setPwError(true); setPwInput('') }
  }

  function logout() { sessionStorage.removeItem(SESSION_KEY); setAuthed(false) }

  function handleSaveEvent(data) {
    if (eventModal === 'new') addEvent(data)
    else updateEvent(eventModal.id, data)
    setEventModal(null)
  }

  function handleSaveVenue(data) {
    if (venueModal === 'new') addVenue(data)
    else updateVenue(venueModal.id, data)
    setVenueModal(null)
  }

  function confirmDeleteEvent(id, name) {
    if (confirm(`¿Eliminar "${name}"?`)) deleteEvent(id)
  }
  function confirmDeleteVenue(id, name) {
    if (confirm(`¿Eliminar la sala "${name}"? También quedarán huérfanos sus eventos.`)) deleteVenue(id)
  }

  /* ── Password gate ── */
  if (!authed) return (
    <div className="min-h-screen bg-c-dark flex items-center justify-center p-4">
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-8 w-full max-w-sm">
        <h1 className="text-white font-bold text-xl mb-1 text-center">Panel Admin</h1>
        <p className="text-zinc-500 text-sm text-center mb-6">Madrid Concerts</p>
        <form onSubmit={login} className="space-y-4">
          <div>
            <input
              className={`${inp} ${pwError ? 'border-red-500' : ''}`}
              type="password" value={pwInput} placeholder="Contraseña"
              onChange={e => { setPwInput(e.target.value); setPwError(false) }}
              autoFocus
            />
            {pwError && <p className="text-red-400 text-xs mt-1">Contraseña incorrecta</p>}
          </div>
          <button className="w-full bg-c-red hover:bg-red-700 text-white font-bold py-2.5 rounded-lg text-sm transition-colors">
            Entrar
          </button>
        </form>
      </div>
    </div>
  )

  const sortedEvents = [...events].sort((a, b) => new Date(a.date) - new Date(b.date))

  /* ── Admin panel ── */
  return (
    <div className="min-h-screen bg-c-dark">
      {/* Admin header */}
      <header className="border-b border-zinc-800 bg-zinc-950 px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold bg-c-red text-white px-2 py-0.5 rounded">ADMIN</span>
          <span className="text-white font-bold text-sm">Madrid Concerts</span>
        </div>
        <div className="flex items-center gap-4">
          <a href="/" target="_blank" className="text-zinc-400 hover:text-white text-xs transition-colors">
            Ver app ↗
          </a>
          <button onClick={logout} className="text-zinc-500 hover:text-white text-xs transition-colors">
            Cerrar sesión
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-zinc-900 p-1 rounded-xl w-fit">
          {[['events', `Eventos (${events.length})`], ['venues', `Salas (${venues.length})`]].map(([key, label]) => (
            <button key={key} onClick={() => setTab(key)}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition-colors
                ${tab === key ? 'bg-white text-black' : 'text-zinc-400 hover:text-white'}`}>
              {label}
            </button>
          ))}
        </div>

        {/* ── Events tab ── */}
        {tab === 'events' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white font-bold text-lg">Eventos</h2>
              <button onClick={() => setEventModal('new')}
                className="bg-c-red hover:bg-red-700 text-white text-sm font-bold px-4 py-2 rounded-lg transition-colors">
                + Nuevo evento
              </button>
            </div>

            <div className="space-y-2">
              {sortedEvents.map(e => {
                const d = new Date(`${e.date}T${e.time}`)
                const dateStr = d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })
                return (
                  <div key={e.id} className="flex items-center gap-4 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 hover:border-zinc-700 transition-colors">
                    {e.image && <img src={e.image} alt="" className="w-12 h-12 rounded-lg object-cover flex-shrink-0 opacity-80" />}
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-semibold text-sm truncate">{e.title}</p>
                      <p className="text-zinc-500 text-xs">
                        {venueMap[e.venue_id]?.name ?? '—'} · {dateStr} · {e.price === 0 ? 'Gratis' : `${e.price}€`}
                      </p>
                    </div>
                    <span className="text-xs bg-zinc-800 text-zinc-400 px-2 py-1 rounded-full hidden sm:block flex-shrink-0">
                      {e.genre}
                    </span>
                    <div className="flex gap-2 flex-shrink-0">
                      <button onClick={() => setEventModal(e)}
                        className="text-zinc-400 hover:text-white text-xs border border-zinc-700 hover:border-zinc-500 px-3 py-1.5 rounded-lg transition-colors">
                        Editar
                      </button>
                      <button onClick={() => confirmDeleteEvent(e.id, e.title)}
                        className="text-zinc-500 hover:text-red-400 text-xs border border-zinc-800 hover:border-red-900 px-3 py-1.5 rounded-lg transition-colors">
                        Borrar
                      </button>
                    </div>
                  </div>
                )
              })}
              {!events.length && <p className="text-zinc-600 text-sm py-8 text-center">No hay eventos. ¡Añade el primero!</p>}
            </div>
          </div>
        )}

        {/* ── Venues tab ── */}
        {tab === 'venues' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white font-bold text-lg">Salas</h2>
              <button onClick={() => setVenueModal('new')}
                className="bg-c-red hover:bg-red-700 text-white text-sm font-bold px-4 py-2 rounded-lg transition-colors">
                + Nueva sala
              </button>
            </div>

            <div className="space-y-2">
              {venues.map(v => (
                <div key={v.id} className="flex items-center gap-4 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 hover:border-zinc-700 transition-colors">
                  {v.image && <img src={v.image} alt="" className="w-12 h-12 rounded-lg object-cover flex-shrink-0 opacity-80" />}
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-semibold text-sm">{v.name}</p>
                    <p className="text-zinc-500 text-xs">{v.address} · {v.neighborhood} · aforo {v.capacity}</p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button onClick={() => setVenueModal(v)}
                      className="text-zinc-400 hover:text-white text-xs border border-zinc-700 hover:border-zinc-500 px-3 py-1.5 rounded-lg transition-colors">
                      Editar
                    </button>
                    <button onClick={() => confirmDeleteVenue(v.id, v.name)}
                      className="text-zinc-500 hover:text-red-400 text-xs border border-zinc-800 hover:border-red-900 px-3 py-1.5 rounded-lg transition-colors">
                      Borrar
                    </button>
                  </div>
                </div>
              ))}
              {!venues.length && <p className="text-zinc-600 text-sm py-8 text-center">No hay salas. ¡Añade la primera!</p>}
            </div>
          </div>
        )}
      </main>

      {/* Event modal */}
      {eventModal && (
        <Modal
          title={eventModal === 'new' ? 'Nuevo evento' : `Editar: ${eventModal.title}`}
          onClose={() => setEventModal(null)}
        >
          <EventForm
            initial={eventModal === 'new' ? emptyEvent() : { ...eventModal, price: String(eventModal.price) }}
            venues={venues}
            onSave={handleSaveEvent}
            onClose={() => setEventModal(null)}
          />
        </Modal>
      )}

      {/* Venue modal */}
      {venueModal && (
        <Modal
          title={venueModal === 'new' ? 'Nueva sala' : `Editar: ${venueModal.name}`}
          onClose={() => setVenueModal(null)}
        >
          <VenueForm
            initial={venueModal === 'new' ? emptyVenue() : { ...venueModal, capacity: String(venueModal.capacity) }}
            onSave={handleSaveVenue}
            onClose={() => setVenueModal(null)}
          />
        </Modal>
      )}
    </div>
  )
}
