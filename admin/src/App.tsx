import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Inbox from './pages/Inbox';
import LoginOverlay from './components/LoginOverlay';
import AdminLayout from './layouts/AdminLayout';
import Dashboard from './pages/Dashboard';
import JobQueue from './pages/JobQueue';
import Inventory from './pages/Inventory';
import Inquiries from './pages/Inquiries';
import Invoices from './pages/Invoices'; // WAG KALIMUTAN I-IMPORT ITO

function App() {
  return (
    <Router>
      <LoginOverlay />
      <Routes>
        <Route element={<AdminLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/queue" element={<JobQueue />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/inquiries" element={<Inquiries />} />
          <Route path="/invoices" element={<Invoices />} /> {/* IDAGDAG ITO */}
          <Route path="/inbox" element={<Inbox />} />
        </Route>
      </Routes>
    </Router>
  );
}
export default App;