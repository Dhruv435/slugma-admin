import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, PackagePlus, ShoppingBag, Users } from 'lucide-react';

const Header = () => {
  const location = useLocation();

  return (
    <header className="flex justify-between items-center py-4 px-8 bg-indigo-700 text-white shadow-xl">
      {/* Admin Panel Title */}
      <h1 className="text-3xl font-extrabold tracking-wide">
        Admin <span className="text-indigo-200">Panel</span>
      </h1>

      {/* Navigation Links */}
      <nav className="flex space-x-8">
        <Link
          to="/admin/dashboard"
          className={`flex items-center space-x-2 text-lg font-medium transition-all duration-300 transform hover:scale-105
            ${location.pathname === '/admin/dashboard' ? 'text-yellow-300 font-bold border-b-2 border-yellow-300 pb-1' : 'text-indigo-100 hover:text-yellow-200'}`
          }
        >
          <Home size={22} />
          <span>Home</span>
        </Link>

        <Link
          to="/admin/addproduct"
          className={`flex items-center space-x-2 text-lg font-medium transition-all duration-300 transform hover:scale-105
            ${location.pathname === '/admin/addproduct' ? 'text-yellow-300 font-bold border-b-2 border-yellow-300 pb-1' : 'text-indigo-100 hover:text-yellow-200'}`
          }
        >
          <PackagePlus size={22} />
          <span>Add Product</span>
        </Link>

        <Link
          to="/admin/orders"
          className={`flex items-center space-x-2 text-lg font-medium transition-all duration-300 transform hover:scale-105
            ${location.pathname === '/admin/orders' ? 'text-yellow-300 font-bold border-b-2 border-yellow-300 pb-1' : 'text-indigo-100 hover:text-yellow-200'}`
          }
        >
          <ShoppingBag size={22} />
          <span>Orders</span>
        </Link>

        <Link
          to="/admin/users"
          className={`flex items-center space-x-2 text-lg font-medium transition-all duration-300 transform hover:scale-105
            ${location.pathname === '/admin/users' ? 'text-yellow-300 font-bold border-b-2 border-yellow-300 pb-1' : 'text-indigo-100 hover:text-yellow-200'}`
          }
        >
          <Users size={22} />
          <span>Users</span>
        </Link>
      </nav>
    </header>
  );
};

export default Header;