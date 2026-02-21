import { createRoot } from 'react-dom/client';
import SetupWizard from '../components/Onboarding/SetupWizard';
import '../dialog-demo-tailwindcss/styles.css';
 // Reuse tailwind styles

const container = document.getElementById('index');
const root = createRoot(container!);
root.render(<SetupWizard />);
