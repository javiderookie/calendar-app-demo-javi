import { Link, NavLink } from 'react-router-dom'

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-c-border bg-c-dark/95 backdrop-blur">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link to="/" className="text-lg font-bold tracking-tight">
          <span className="text-c-red">Madrid</span>
          <span className="text-white">Concerts</span>
        </Link>
        <nav className="flex gap-6">
          {[['/', 'Eventos'], ['/salas', 'Salas']].map(([to, label]) => (
            <NavLink key={to} to={to} end={to === '/'}
              className={({ isActive }) =>
                `text-sm font-medium transition-colors ${isActive ? 'text-white' : 'text-gray-400 hover:text-white'}`
              }
            >{label}</NavLink>
          ))}
        </nav>
      </div>
    </header>
  )
}
