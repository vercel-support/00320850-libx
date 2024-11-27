import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import IndexView from './views/Index';
import ExportView from './views/Export';

function R() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<IndexView />} />
        <Route path="/x" element={<ExportView />} />
      </Routes>
    </Router>
  );
}

export default R;
