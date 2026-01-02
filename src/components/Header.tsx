import { NavLink } from 'react-router-dom'

const linkStyle = {
  textDecoration: 'none',
  padding: '8px 12px',
  borderRadius: 6,
}

export default function Header() {
  return (
    <header
      style={{
        height: 56,
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        padding: '0 16px',
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
      }}
    >
      <strong>React Flow Demo</strong>

      <nav style={{ display: 'flex', gap: 8 }}>
        <NavLink
          to="/"
          style={({ isActive }) => ({
            ...linkStyle,
            backgroundColor: isActive ? '#e2e8f0' : 'transparent',
            color: '#0f172a',
          })}
        >
          Home
        </NavLink>

        <NavLink
          to="/custom"
          style={({ isActive }) => ({
            ...linkStyle,
            backgroundColor: isActive ? '#e2e8f0' : 'transparent',
            color: '#0f172a',
          })}
        >
          Custom
        </NavLink>

        <NavLink
          to="/about"
          style={({ isActive }) => ({
            ...linkStyle,
            backgroundColor: isActive ? '#e2e8f0' : 'transparent',
            color: '#0f172a',
          })}
        >
          About
        </NavLink>
      </nav>
    </header>
  )
}
