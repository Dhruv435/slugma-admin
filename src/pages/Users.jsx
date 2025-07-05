import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = 'http://localhost:3001';

const Users = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState('');

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      setMessage('');
      const response = await fetch(`${API_BASE_URL}/api/users`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      setUsers(data);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(`Failed to load users: ${err.message}.`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDeleteUser = async (userId, username) => {
    const confirmation = window.confirm(`Are you sure you want to delete user "${username}"? This action cannot be undone.`);
    if (!confirmation) {
      return;
    }

    try {
      setMessage('');
      const response = await fetch(`${API_BASE_URL}/api/users/${userId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setMessage(`✅ User "${username}" deleted successfully!`);
        setUsers(users.filter(user => user._id !== userId));
      } else {
        const errorData = await response.json();
        setMessage(`❌ Failed to delete user "${username}": ${errorData.message || 'Unknown error'}`);
      }
    } catch (err) {
      console.error('Frontend network error during user delete:', err);
      setMessage(`❌ Network error deleting user "${username}": ${err.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8 flex justify-top items-top">
      <div className="w-full mx-auto max-w-6xl bg-white rounded-3xl shadow-2xl p-12 transform hover:scale-[1.005] transition-transform duration-300 ease-out">

        <h2 className="text-5xl font-extrabold text-gray-900 mb-10 text-center leading-tight tracking-tight">
          Registered <span className="text-indigo-600">Users</span>
        </h2>

        {message && (
          <div className={`p-4 mb-8 rounded-lg font-semibold text-lg ${message.startsWith('✅') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'} shadow-md border ${message.startsWith('✅') ? 'border-green-200' : 'border-red-200'}`}>
            {message}
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-500"></div>
            <p className="mt-6 text-2xl text-indigo-700 font-semibold">Fetching user data...</p>
            <p className="mt-2 text-gray-500">Please wait a moment.</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-300 text-red-700 px-8 py-6 rounded-xl shadow-lg mb-8" role="alert">
            <strong className="font-bold text-xl">Oops!</strong>
            <span className="block sm:inline ml-4 text-lg">{error}</span>
            <p className="text-sm mt-2">If the issue persists, please contact support.</p>
          </div>
        )}

        {!loading && !error && users.length === 0 && (
          <div className="text-center text-gray-600 text-2xl py-24 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50/70 shadow-inner">
            <p className="mb-2">No users registered yet.</p>
            <p className="text-lg">Start by adding new users to your system!</p>
          </div>
        )}

        {!loading && !error && users.length > 0 && (
          <div className="overflow-hidden rounded-xl shadow-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  <th scope="col" className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Username</th>
                  <th scope="col" className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Age</th>
                  <th scope="col" className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Mobile Number</th>
                  <th scope="col" className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Registered On</th>
                  <th scope="col" className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {users.map((user) => (
                  <tr key={user._id} className="hover:bg-blue-50 transition-all duration-200 ease-in-out">
                    <td className="px-6 py-4 whitespace-nowrap text-base font-medium text-gray-900">{user.username}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-base text-gray-700">{user.age}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-base text-gray-700">{user.mobileNumber}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-base text-gray-700">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => handleDeleteUser(user._id, user.username)}
                        className="font-semibold text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 px-4 py-2 rounded-lg transition-colors duration-200 shadow-sm border border-red-200"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Users;