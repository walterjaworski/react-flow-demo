import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Header from './components/Header'
import { TooltipProvider } from './components/ui/tooltip'
import About from './pages/About'
import Custom from './pages/Custom'
import Home from './pages/Home'

export default function App() {
  return (
    <BrowserRouter>
      <div className="grid grid-rows-[56px_1fr] h-screen">
        <Header />

        <main className="overflow-hidden p-4">
          <TooltipProvider>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/custom" element={<Custom />} />
              <Route path="/about" element={<About />} />
            </Routes>
          </TooltipProvider>
        </main>
      </div>
    </BrowserRouter>
  )
}
