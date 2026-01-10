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


        <div className="flex-1" />
      </nav>
      <nav className="flex gap-2 ml-auto">
        <a
          href="https://www.linkedin.com/in/walterjaworski"
          target="_blank"
          rel="noopener noreferrer"
          className="
            flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium
            bg-sky-600 transition-colors text-white
            hover:bg-sky-700
          "
        >
          LinkedIn
        </a>

        <a
          href="https://github.com/walterjaworski"
          target="_blank"
          rel="noopener noreferrer"
          className="
            flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium
            bg-slate-800 text-white transition-colors
            hover:bg-slate-600
          "
        >
          GitHub
        </a>
      </nav>
    </header>
  )
}
