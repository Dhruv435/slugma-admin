import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Clock, Package, Truck, XCircle } from 'lucide-react';

// === CRUCIAL FIX: Updated API_BASE_URL to your deployed backend URL ===
const API_BASE_URL = 'https://slugma-backend.vercel.app'; 

const orderStatusOptions = ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Delivered & Confirmed'];
const deliveryOptions = [
  'Option 1 - 5 days to delivery',
  'Option 2 - 3 days to delivery',
  'Option 3 - 2 days to delivery',
  'Option 4 - 1 day to delivery',
  'Option 5 - Arriving Today'
];

const getDeliveryDotColor = (currentOption, targetOption) => {
  const currentIndex = deliveryOptions.indexOf(currentOption);
  const targetIndex = deliveryOptions.indexOf(targetOption);

  if (targetIndex < currentIndex) {
    return 'bg-green-500';
  } else if (targetIndex === currentIndex) {
    return 'bg-blue-500';
  } else {
    return 'bg-gray-300';
  }
};

const Orders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState('');

  const [editingOrderId, setEditingOrderId] = useState(null);
  const [currentEditStatus, setCurrentEditStatus] = useState('');
  const [currentEditDelivery, setCurrentEditDelivery] = useState('');
  const [currentEditAdminMessage, setCurrentEditAdminMessage] = useState('');

  const [showHistory, setShowHistory] = useState(false);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      let url = `${API_BASE_URL}/api/orders`;
      if (showHistory) {
        url += '?status=history';
      }
      const response = await fetch(url);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      setOrders(data);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError(`Failed to load orders: ${err.message}.`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [showHistory]);

  const handleEditClick = (order) => {
    if (order.orderStatus === 'Delivered & Confirmed' || order.orderStatus === 'Cancelled') {
        setMessage('❌ Cannot edit a completed or cancelled order.');
        return;
    }
    setEditingOrderId(order._id);
    setCurrentEditStatus(order.orderStatus);
    setCurrentEditDelivery(order.deliveryOption);
    setCurrentEditAdminMessage(order.adminMessage || '');
  };

  const handleCancelEdit = () => {
    setEditingOrderId(null);
    setCurrentEditStatus('');
    setCurrentEditDelivery('');
    setCurrentEditAdminMessage('');
  };

  const handleUpdateOrder = async (orderId) => {
    try {
      setMessage('');
      const response = await fetch(`${API_BASE_URL}/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderStatus: currentEditStatus,
          deliveryOption: currentEditDelivery,
          adminMessage: currentEditAdminMessage
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update order');
      }

      setMessage('✅ Order updated successfully!');
      fetchOrders();
      handleCancelEdit();
    } catch (err) {
      console.error('Error updating order:', err);
      setMessage(`❌ Failed to update order: ${err.message}`);
    }
  };

  const handleAddToHistory = async (orderId) => {
    setMessage('');
    // Replaced window.confirm with a custom modal/message box for better UX in a deployed environment
    // For now, I'll keep it as a direct action for simplicity, but recommend a custom modal.
    if (!confirm('Are you sure you want to mark this order as delivered and move to history? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderStatus: 'Delivered & Confirmed',
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to move order to history');
      }

      setMessage('✅ Order moved to history successfully!');
      fetchOrders();
    } catch (err) {
      console.error('Error moving order to history:', err);
      setMessage(`❌ Failed to move order to history: ${err.message}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8 flex justify-center items-center">
        <div className="w-full mx-auto max-w-6xl bg-white rounded-3xl shadow-2xl p-12 text-center">
          <h2 className="text-4xl font-extrabold text-gray-900 mb-6">Loading Orders</h2>
          <div className="flex flex-col items-center justify-center py-10">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-500"></div>
            <p className="mt-6 text-2xl text-indigo-700 font-semibold">Fetching order data...</p>
            <p className="mt-2 text-gray-500">Please wait a moment.</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8 flex justify-center items-center">
        <div className="w-full mx-auto max-w-6xl bg-red-50 border border-red-300 text-red-700 px-8 py-6 rounded-xl shadow-lg text-center" role="alert">
          <strong className="font-bold text-xl">Oops!</strong>
          <span className="block sm:inline ml-4 text-lg">{error}</span>
          <p className="text-sm mt-2">There was an issue loading the orders. Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    
      <div className="w-full mx-auto max-w-7xl bg-white rounded-3xl shadow-2xl p-12">
        <h2 className="text-5xl font-extrabold text-gray-900 mb-10 text-center leading-tight tracking-tight">
          Order <span className="text-indigo-600">Management</span>
        </h2>

        {message && (
          <div className={`p-4 mb-8 rounded-lg font-semibold text-lg ${message.startsWith('✅') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'} shadow-md border ${message.startsWith('✅') ? 'border-green-200' : 'border-red-200'}`}>
            {message}
          </div>
        )}

        <div className="flex justify-center space-x-4 mb-8">
          <button
            onClick={() => setShowHistory(false)}
            className={`px-8 py-3 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-md
              ${!showHistory ? 'bg-indigo-600 text-white shadow-indigo-400/50' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`
            }
          >
            Active Orders
          </button>
          <button
            onClick={() => setShowHistory(true)}
            className={`px-8 py-3 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-md
              ${showHistory ? 'bg-indigo-600 text-white shadow-indigo-400/50' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`
            }
          >
            Order History
          </button>
        </div>

        {orders.length === 0 ? (
          <div className="text-center text-gray-600 text-2xl py-24 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50/70 shadow-inner">
            <p className="mb-2">No {showHistory ? 'historical' : 'active'} orders found.</p>
            <p className="text-lg">Keep an eye out for new orders!</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl shadow-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Order ID</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">User</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Products</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Total Price</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Shipping Address</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Payment</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Order Status</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Delivery</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Admin Message</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {orders.map((order) => (
                  <tr key={order._id} className="hover:bg-blue-50 transition-all duration-200 ease-in-out">
                    <td className="px-6 py-4 whitespace-normal text-sm font-medium text-gray-900 break-all">{order._id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-base text-gray-700">
                      {order.userId ? `${order.userId.username} (${order.userId.mobileNumber})` : 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-base text-gray-700">
                      <ul className="list-disc list-inside space-y-1">
                        {order.products.map((item, idx) => (
                          <li key={idx} className="flex items-center space-x-2">
                            <img
                              src={`${API_BASE_URL}${item.image}`}
                              alt={item.name || 'Product'}
                              className="w-10 h-10 object-cover rounded-md border border-gray-200 shadow-sm"
                              onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/40x40/E2E8F0/A0AEC0?text=P"; }}
                            />
                            <span>
                              {item.name} (x{item.quantity}) - ₹{item.price.toFixed(2)}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-base text-gray-700 font-semibold">₹{order.totalPrice.toFixed(2)}</td>
                    <td className="px-6 py-4 text-base text-gray-700">
                      {order.shippingAddress.personName}, {order.shippingAddress.mobileNumber}<br />
                      {order.shippingAddress.address}, {order.shippingAddress.pincode}<br />
                      {order.shippingAddress.state}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-base text-gray-700">{order.paymentMethod}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {editingOrderId === order._id ? (
                        <select
                          value={currentEditStatus}
                          onChange={(e) => setCurrentEditStatus(e.target.value)}
                          className="p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-700"
                        >
                          {orderStatusOptions.filter(option => option !== 'Delivered & Confirmed' && option !== 'Cancelled').map(option => (
                              <option key={option} value={option}>{option}</option>
                          ))}
                        </select>
                      ) : (
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold shadow-sm ${
                          order.orderStatus === 'Delivered' || order.orderStatus === 'Delivered & Confirmed' ? 'bg-green-100 text-green-800' :
                          order.orderStatus === 'Cancelled' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {order.orderStatus}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {editingOrderId === order._id ? (
                        <div className="flex flex-col space-y-2">
                          {deliveryOptions.map((option) => (
                            <label key={option} className="inline-flex items-center cursor-pointer">
                              <input
                                type="radio"
                                name={`deliveryOption-${order._id}`}
                                value={option}
                                checked={currentEditDelivery === option}
                                onChange={(e) => setCurrentEditDelivery(e.target.value)}
                                className="form-radio h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                              />
                              <span className="ml-2 text-gray-700 text-sm">{option.split(' - ')[0]}</span>
                            </label>
                          ))}
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          {deliveryOptions.map((option, idx) => (
                            <div
                              key={idx}
                              className={`w-3 h-3 rounded-full ${getDeliveryDotColor(order.deliveryOption, option)} shadow-sm`}
                              title={option}
                            ></div>
                          ))}
                          <span className="text-gray-700 text-sm font-medium">{order.deliveryOption.split(' - ')[0]}</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-base text-gray-700 max-w-xs">
                      {editingOrderId === order._id ? (
                        <textarea
                          value={currentEditAdminMessage}
                          onChange={(e) => setCurrentEditAdminMessage(e.target.value)}
                          rows="3"
                          className="w-full p-2 border border-gray-300 rounded-md text-sm resize-y focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Add admin message..."
                        />
                      ) : (
                        <span className="block max-h-20 overflow-y-auto custom-scrollbar">
                          {order.adminMessage || <span className="italic text-gray-500">No message</span>}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {editingOrderId === order._id ? (
                        <div className="flex flex-col gap-2">
                          <button
                            onClick={() => handleUpdateOrder(order._id)}
                            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200 shadow-md flex items-center justify-center text-sm"
                          >
                            <CheckCircle size={16} className="mr-1" /> Save
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200 shadow-md flex items-center justify-center text-sm"
                          >
                            <XCircle size={16} className="mr-1" /> Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-2">
                          {order.orderStatus !== 'Delivered & Confirmed' && order.orderStatus !== 'Cancelled' ? (
                            <>
                              <button
                                onClick={() => handleEditClick(order)}
                                className="text-indigo-600 hover:text-indigo-800 px-4 py-2 border border-indigo-500 rounded-lg hover:bg-indigo-50 transition-colors duration-200 shadow-sm text-sm"
                              >
                                Edit Order
                              </button>
                              <button
                                onClick={() => handleAddToHistory(order._id)}
                                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors duration-200 text-sm shadow-md"
                              >
                                Mark as Delivered
                              </button>
                            </>
                          ) : (
                            <span className="text-gray-500 italic text-sm px-4 py-2">Archived</span>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    
  );
};

export default Orders;
