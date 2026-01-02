import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Header from './components/Header'
import About from './pages/About'
import Custom from './pages/Custom'
import Home from './pages/Home'

export default function App() {
  return (
    <BrowserRouter>
      <div
        style={{
          display: 'grid',
          gridTemplateRows: '56px 1fr',
          height: '100%',
        }}
      >
        <Header />

        <main style={{ overflow: 'hidden' }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/custom" element={<Custom />} />
            <Route path="/about" element={<About />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}
