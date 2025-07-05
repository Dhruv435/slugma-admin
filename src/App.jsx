import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import Products from './pages/Products';
import AddProduct from './pages/AddProduct';
import Orders from './pages/Orders';
import Users from './pages/Users';
import { LogOut } from 'lucide-react';
import axios from 'axios'; // Import axios

// --- GLOBAL DEBUGGING LOG: This should appear in your browser console when App.jsx loads ---
console.log('App.jsx (Admin Frontend) loaded and executing. Version with Axios and MOST AGGRESSIVE POST handling.');

// === CRUCIAL FIX: Updated API_BASE_URL to your deployed backend URL ===
// This URL points to your deployed Node.js backend on Vercel.
const API_BASE_URL = 'https://slugma-backend.vercel.app'; 

/**
 * AdminLoginPage Component
 * Handles the login form and authentication for administrators.
 * It sends a POST request to the backend's admin login endpoint using Axios.
 * @param {object} props - Component props.
 * @param {function} props.onLoginSuccess - Callback function to run on successful login.
 */
const AdminLoginPage = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * Handles the form submission for admin login.
   * Prevents default form submission to handle it via Axios.
   * Sends username and password to the backend.
   * @param {Event} e - The form submission event.
   */
  const handleSubmit = async (e) => {
    // Attempt to prevent default submission. If it fails for some reason, log it.
    if (e && typeof e.preventDefault === 'function') {
      e.preventDefault(); 
      console.log('e.preventDefault() called successfully.');
    } else {
      console.error('e.preventDefault() could not be called or event object is missing.');
    }

    setMessage(''); // Clear any previous messages
    setIsSubmitting(true); // Set loading state

    // --- Debugging logs to confirm request details before sending ---
    console.log('--- Admin Login Attempt (using Axios) ---');
    console.log('API URL:', `${API_BASE_URL}/api/admin/login`);
    console.log('Request Method: POST (intended)'); // Explicitly state the intended method
    console.log('Payload (username only):', { username }); // Log username, avoid logging password for security

    try {
      // Use axios.post to send the request
      const response = await axios.post(`${API_BASE_URL}/api/admin/login`, {
        username, // Axios automatically serializes this to JSON
        password,
      }, {
        headers: {
          'Content-Type': 'application/json', // Ensure content type is set
        },
      });

      // Axios wraps the response data in a 'data' property
      const result = response.data; 

      // Axios throws an error for non-2xx status codes, so we don't need response.ok check here
      localStorage.setItem('adminToken', result.token); // Store the admin token
      onLoginSuccess(); // Notify parent component of successful login
      console.log('✅ Admin login successful!');

    } catch (err) {
      // Axios errors have a 'response' property for server errors
      console.error('❌ Admin Login Error:', err);
      if (axios.isAxiosError(err) && err.response && err.response.data && err.response.data.message) {
        setMessage(`❌ ${err.response.data.message}`); // Display backend error message
      } else {
        setMessage(`❌ Login failed: ${err.message || 'Network error'}`); // Display generic error
      }
    } finally {
      setIsSubmitting(false); // Reset loading state
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center ">
      <div className="max-w-lg w-full bg-white rounded-3xl shadow-2xl overflow-hidden transform transition-all duration-500 hover:scale-[1.01]">
        <div className="p-8 text-center bg-gradient-to-r from-blue-700 to-indigo-700 text-white rounded-t-3xl">
          <h2 className="text-5xl font-extrabold mb-3 tracking-tight">Admin Portal</h2>
          <p className="text-blue-100 text-xl font-light">Secure Access</p>
        </div>
        <form 
          className="p-10 space-y-8" 
          // Removed onSubmit={handleSubmit} from here
          method="POST" // Explicitly set form method to POST
          action="#" // Prevents browser from trying to navigate if JS fails (though e.preventDefault() is primary)
        >
          <div className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-base font-semibold text-gray-700 mb-2">Username</label>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                required
                className="w-full px-5 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-3 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-400 transition duration-300 ease-in-out text-lg"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-base font-semibold text-gray-700 mb-2">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="w-full px-5 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-3 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-400 transition duration-300 ease-in-out text-lg"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {message && (
            <div className="bg-red-50 text-red-700 border border-red-200 p-4 rounded-xl text-base text-center font-medium shadow-sm animate-fade-in-down">
              {message}
            </div>
          )}

          <div>
            <button
              type="submit"
              onClick={handleSubmit} // This is now the SOLE trigger for handleSubmit
              className="w-full flex items-center justify-center py-4 px-6 border border-transparent text-xl font-bold rounded-xl text-white bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 focus:outline-none focus:ring-3 focus:ring-offset-2 focus:ring-blue-500 shadow-lg transition duration-300 ease-in-out transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Authenticating...' : 'Log In Securely'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/**
 * App Component
 * The main component for the admin dashboard, handling routing and authentication state.
 */
const App = () => {
  // State to manage admin authentication status, initialized from localStorage
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(
    !!localStorage.getItem('adminToken')
  );

  /**
   * Callback function for successful admin login.
   * Sets the authentication state to true.
   */
  const handleAdminLoginSuccess = () => {
    setIsAdminAuthenticated(true);
  };

  /**
   * Handles admin logout.
   * Removes the admin token from localStorage and resets authentication state.
   */
  const handleAdminLogout = () => {
    localStorage.removeItem('adminToken');
    setIsAdminAuthenticated(false);
  };

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 flex flex-col font-inter">
        {/* Header Section */}
        <header className="bg-gradient-to-r from-blue-800 to-purple-900 text-white p-5 shadow-xl">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center">
            <h1 className="text-3xl sm:text-4xl font-extrabold mb-4 sm:mb-0 tracking-wide">
              Admin Dashboard
            </h1>
            {/* Navigation links visible only when authenticated */}
            {isAdminAuthenticated && (
              <nav className="w-full sm:w-auto">
                <ul className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-8 items-center">
                  <li><a href="/admin/home" className="hover:text-blue-200 transition-colors text-lg font-medium py-2 px-3 rounded-md hover:bg-blue-700">Home</a></li>
                  <li><a href="/admin/products" className="hover:text-blue-200 transition-colors text-lg font-medium py-2 px-3 rounded-md hover:bg-blue-700">Products</a></li>
                  <li><a href="/admin/orders" className="hover:text-blue-200 transition-colors text-lg font-medium py-2 px-3 rounded-md hover:bg-blue-700">Orders</a></li>
                  <li><a href="/admin/users" className="hover:text-blue-200 transition-colors text-lg font-medium py-2 px-3 rounded-md hover:bg-blue-700">Users</a></li>
                  <li>
                    <button
                      onClick={handleAdminLogout}
                      className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5 px-5 rounded-lg transition-all duration-200 flex items-center shadow-lg transform hover:scale-105 active:scale-95"
                    >
                      <LogOut size={20} className="mr-2" /> Logout
                    </button>
                  </li>
                </ul>
              </nav>
            )}
            {/* Login button visible only when not authenticated */}
             {!isAdminAuthenticated && (
                <a href="/admin/login" className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2.5 px-5 rounded-lg transition-all duration-200 shadow-lg transform hover:scale-105 active:scale-95">
                    Login
                </a>
            )}
          </div>
        </header>

        {/* Main Content Area with Routing */}
        <main className="flex-grow p-6 sm:p-8">
          <Routes>
            {/* Route for Admin Login Page */}
            <Route
              path="/admin/login"
              element={
                isAdminAuthenticated ? (
                  // If already authenticated, redirect to admin home
                  <Navigate to="/admin/home" replace />
                ) : (
                  // Otherwise, show the AdminLoginPage
                  <AdminLoginPage onLoginSuccess={handleAdminLoginSuccess} />
                )
              }
            />

            {/* Protected Admin Routes */}
            <Route
              path="/admin/*" // Catch all sub-routes under /admin
              element={
                isAdminAuthenticated ? (
                  // If authenticated, render nested admin routes
                  <Routes>
                    <Route index element={<Navigate to="/admin/home" replace />} /> {/* Default admin route */}
                    <Route path="home" element={<HomePage />} />
                    <Route path="products" element={<Products />} />
                    <Route path="add-product" element={<AddProduct />} />
                    <Route path="edit-product/:id" element={<AddProduct />} /> {/* Route for editing existing products */}
                    <Route path="orders" element={<Orders />} />
                    <Route path="users" element={<Users />} />
                    <Route path="*" element={<Navigate to="/admin/home" replace />} /> {/* Fallback for unknown admin paths */}
                  </Routes>
                ) : (
                  // If not authenticated, redirect to admin login
                  <Navigate to="/admin/login" replace />
                )
              }
            />

            {/* Redirect /admin to login if not authenticated, or home if authenticated */}
            <Route path="/admin" element={isAdminAuthenticated ? <Navigate to="/admin/home" replace /> : <Navigate to="/admin/login" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;
