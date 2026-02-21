import { createRoot } from 'react-dom/client';
import MainSidebar from './components/MainSidebar';
import '../dialog-demo-tailwindcss/styles.css';

const container = document.getElementById('index');
const root = createRoot(container);
root.render(<MainSidebar />);
