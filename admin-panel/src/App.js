import React, { Suspense, useEffect } from 'react';
import { HashRouter, Route, Routes, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { CSpinner, useColorModes } from '@coreui/react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './scss/style.scss';
import PrivateRoute from './components/admin/PrivateRoute';

// Containers
const DefaultLayout = React.lazy(() => import('./layout/DefaultLayout'));

// Admin Components
const AdminLogin = React.lazy(() => import('./components/admin/AdminLogin'));
const PendingOrders = React.lazy(() => import('./components/admin/PendingOrders'));
import withAuth from './utils/withAuth';

const App = () => {
  const { isColorModeSet, setColorMode } = useColorModes('coreui-free-react-admin-template-theme');
  const storedTheme = useSelector((state) => state.theme);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.href.split('?')[1]);
    const theme = urlParams.get('theme') && urlParams.get('theme').match(/^[A-Za-z0-9\s]+/)[0];
    if (theme) {
      setColorMode(theme);
    }

    if (isColorModeSet()) {
      return;
    }

    setColorMode(storedTheme);
  }, []);

  return (
    <HashRouter>
      <ToastContainer /> {/* Include ToastContainer here */}
      <Suspense
        fallback={
          <div className="pt-3 text-center">
            <CSpinner color="primary" variant="grow" />
          </div>
        }
      >
        <Routes>
          {/* Redirect root URL to /admin/login once he open the localhost::3000*/}
          <Route path="/" element={<Navigate to="/admin/login" replace />} />

          <Route path="*" name="Home" element={<DefaultLayout />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route
            path="/admin/dashboard"
            element={
              <PrivateRoute>
                <PendingOrders />
              </PrivateRoute>
            }
          />
        </Routes>
      </Suspense>
    </HashRouter>
  );
};

export default App;
