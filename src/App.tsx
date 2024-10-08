import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import SwapInterface from './avnu/AVNU'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
     <SwapInterface />
    </>
  )
}

export default App
