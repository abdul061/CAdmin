import { Fragment } from "react";
import { BrowserRouter as Router, Route, Routes, useLocation } from "react-router-dom";
import Navbar from './components/Nav'
import LoginPage from './pages/Login'
import AddStd from './pages/AddStudent'

function App() {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}

function AppRoutes() {
    const location = useLocation();
  return (
    <Fragment>
      <Routes>
        <Route path="/addstd" element={<Navbar />} />
        <Route path="/" element={<LoginPage />} />
        <Route path='/addstd' element={<AddStd />} />
        {location.pathname === '/login' && <Navbar />}
      </Routes>
    </Fragment>
  );
}

export default App;
