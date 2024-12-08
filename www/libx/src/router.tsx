import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import IndexView from './views/Index';

function R() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<IndexView />} />
      </Routes>
    </Router>
  );
}

export default R;
