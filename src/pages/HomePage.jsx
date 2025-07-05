import React from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate for navigation
import { ShoppingBag, Users as UsersIcon, ListOrdered } from 'lucide-react'; // Importing icons from lucide-react

const HomePage = () => {
  const navigate = useNavigate(); // Initialize useNavigate hook

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="text-center mb-12">
        <h2 className="text-6xl font-extrabold text-gray-900 mb-4 animate-fade-in-down tracking-tight">
          Welcome to Your <span className="text-indigo-600">Admin Dashboard</span>
        </h2>
        <p className="text-xl text-gray-700 max-w-2xl mx-auto animate-fade-in leading-relaxed">
          Effortlessly manage your e-commerce operations, keep track of inventory, oversee customer orders, and maintain user accounts with precision and ease.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl">
        {/* Products Card */}
        <div
          className="bg-white p-8 rounded-2xl shadow-xl flex flex-col items-center text-center transform hover:scale-105 transition-transform duration-300 group cursor-pointer border border-gray-100 hover:border-indigo-300"
          onClick={() => navigate('/products')} // Navigate to products page
        >
          <div className="p-4 bg-indigo-100 rounded-full mb-5 transition-colors duration-300 group-hover:bg-indigo-200">
            <ShoppingBag size={48} className="text-indigo-600 group-hover:text-indigo-700" />
          </div>
          <h3 className="text-3xl font-bold text-gray-800 mb-3 group-hover:text-indigo-800 transition-colors duration-300">
            Products
          </h3>
          <p className="text-gray-600 text-base leading-relaxed">
            Take full control of your catalog. Add new products, update details, manage stock levels, and organize your offerings.
          </p>
        </div>

        {/* Orders Card */}
        <div
          className="bg-white p-8 rounded-2xl shadow-xl flex flex-col items-center text-center transform hover:scale-105 transition-transform duration-300 group cursor-pointer border border-gray-100 hover:border-blue-300"
          onClick={() => navigate('/orders')} // Navigate to orders page
        >
          <div className="p-4 bg-blue-100 rounded-full mb-5 transition-colors duration-300 group-hover:bg-blue-200">
            <ListOrdered size={48} className="text-blue-600 group-hover:text-blue-700" />
          </div>
          <h3 className="text-3xl font-bold text-gray-800 mb-3 group-hover:text-blue-800 transition-colors duration-300">
            Orders
          </h3>
          <p className="text-gray-600 text-base leading-relaxed">
            Monitor and process all customer orders. Update statuses, track shipments, and ensure timely deliveries.
          </p>
        </div>

        {/* Users Card */}
        <div
          className="bg-white p-8 rounded-2xl shadow-xl flex flex-col items-center text-center transform hover:scale-105 transition-transform duration-300 group cursor-pointer border border-gray-100 hover:border-purple-300"
          onClick={() => navigate('/users')} // Navigate to users page
        >
          <div className="p-4 bg-purple-100 rounded-full mb-5 transition-colors duration-300 group-hover:bg-purple-200">
            <UsersIcon size={48} className="text-purple-600 group-hover:text-purple-700" />
          </div>
          <h3 className="text-3xl font-bold text-gray-800 mb-3 group-hover:text-purple-800 transition-colors duration-300">
            Users
          </h3>
          <p className="text-gray-600 text-base leading-relaxed">
            Manage your customer base. View user profiles, update roles, and maintain a secure user environment.
          </p>
        </div>
      </div>
    </div>
  );
};

export default HomePage;