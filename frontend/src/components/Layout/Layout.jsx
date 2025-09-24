import { Link, useLocation } from 'react-router-dom'

const NavLink = ({ to, label }) => {
  const { pathname } = useLocation()
  const active = pathname === to
  return (
    <Link
      to={to}
      className={`block rounded-xl px-4 py-2 font-medium transition hover:bg-gray-100 ${active ? 'bg-gray-200' : ''}`}
    >
      {label}
    </Link>
  )
}

export default function Layout({ children }) {
  return (
    <div className="min-h-screen grid grid-cols-[240px_1fr]">
      <aside className="p-4 border-r bg-white">
        <h1 className="text-xl font-bold mb-4">Arabic Juba</h1>
        <nav className="space-y-1">
          <NavLink to="/dashboard" label="Dashboard" />
          <NavLink to="/lessons" label="Lessons" />
          <NavLink to="/profile" label="Profile" />
        </nav>
      </aside>
      <main className="p-6">{children}</main>
    </div>
  )
}