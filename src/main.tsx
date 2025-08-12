
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { initializeMonitoring } from './utils/monitoring'
import { registerServiceWorker } from './registerSW'

// Initialize monitoring and service worker
initializeMonitoring();
registerServiceWorker();

createRoot(document.getElementById("root")!).render(<App />);