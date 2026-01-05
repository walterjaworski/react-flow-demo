import { NavLink } from 'react-router-dom';

const CustomNavLink = ({ to, children }: { to: string; children: React.ReactNode }) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) => `
        px-3 py-2 rounded-md text-sm font-medium transition-colors
        text-slate-900
        hover:bg-slate-200
        ${isActive ? 'bg-slate-200' : 'bg-transparent'}
      `}
    >
      {children}
    </NavLink>
  )
}

export default function Header() {
  return (
    <header className="flex items-center gap-4 px-4 bg-white border-b border-gray-200">
      <strong>React Flow Demo</strong>

      <nav className="flex gap-2">
        <CustomNavLink to="/">
          Home
        </CustomNavLink>

        <CustomNavLink to="/custom">
          Custom
        </CustomNavLink>

        <CustomNavLink to="/about">
          About
        </CustomNavLink>
      </nav>
    </header>
  )
}
