import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import '../node_modules/font-awesome/css/font-awesome.min.css'; 
import { BrowserRouter } from 'react-router-dom'
import CartProvider from './hooks/useCart.tsx';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';
createRoot(document.getElementById('root')!).render(
  
  <StrictMode>
    <BrowserRouter>
    <CartProvider>

    <App />
    </CartProvider>
    
    </BrowserRouter>
  </StrictMode>,
)
