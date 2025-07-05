import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, Edit, Trash2, Star } from 'lucide-react';

const API_BASE_URL = 'http://localhost:3001';

const Products = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`${API_BASE_URL}/api/products`);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        setProducts(data);
      } catch (err) {
        setError(`Failed to load products: ${err.message}.`);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleDeleteProduct = async (productId) => {
    setMessage('');
    if (!window.confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/products/${productId}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to delete product.');
      }

      setMessage(`✅ ${result.message}`);
      setProducts(products.filter(product => product._id !== productId));
    } catch (err) {
      setMessage(`❌ Error: ${err.message}`);
    }
  };

  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    const stars = [];
    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={`full-${i}`} size={16} fill="currentColor" className="text-yellow-500" />);
    }
    if (hasHalfStar) {
      stars.push(<Star key="half" size={16} fill="currentColor" className="text-yellow-500 rotate-180" style={{clipPath: 'inset(0 50% 0 0)'}}/>);
    }
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} size={16} className="text-gray-400" />);
    }
    return stars;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="p-10 bg-white rounded-lg shadow-xl text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-5">Loading Products</h2>
          <div className="text-blue-600 font-semibold text-lg flex items-center justify-center">
            <svg className="animate-spin inline-block mr-4 h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Fetching product data...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="p-10 max-w-lg w-full bg-red-100 border border-red-400 text-red-700 px-6 py-5 rounded-lg shadow-xl">
          <strong className="font-bold text-xl">Error!</strong>
          <span className="block sm:inline ml-3 text-lg">{error}</span>
        </div>
      </div>
    );
  }

  return (
    
      <div className="w-full mx-auto bg-white rounded-2xl shadow-xl p-10">
        <div className="flex justify-between items-center mb-10">
          <h2 className="text-5xl font-extrabold text-gray-900 leading-tight">Product Catalog</h2>
          <button
            onClick={() => navigate('/admin/add-product')}
            className="bg-indigo-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-indigo-700 transition duration-300 ease-in-out transform hover:scale-105 flex items-center shadow-lg"
          >
            <PlusCircle size={24} className="mr-3" />
            Add New Product
          </button>
        </div>

        {message && (
          <div className={`p-5 mb-8 rounded-lg font-medium text-xl ${message.startsWith('✅') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'} shadow-md`}>
            {message}
          </div>
        )}

        {products.length === 0 ? (
          <div className="text-center text-gray-500 text-2xl py-20 border-2 border-gray-200 rounded-lg bg-white">
            No products found. Let's add some!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto border-separate [border-spacing:0_1rem]">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider rounded-tl-lg">Image</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Price</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Stock</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Avg. Rating</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider rounded-tr-lg">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product, index) => (
                  <tr key={product._id} className="bg-white shadow-lg rounded-xl hover:bg-gray-50 transition-all duration-300 ease-in-out">
                    <td className="px-6 py-5 whitespace-nowrap rounded-l-xl">
                      <img
                        src={`${API_BASE_URL}${product.image}`}
                        alt={product.name}
                        className="w-24 h-24 object-cover rounded-xl border-2 border-gray-200 shadow-md transform hover:scale-105 transition-transform duration-200"
                        onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/96x96/E0E0E0/A0A0A0?text=No+Image"; }}
                      />
                    </td>
                    <td className="px-6 py-5 text-base font-semibold text-gray-900">{product.name}</td>
                    <td className="px-6 py-5 whitespace-normal text-sm text-gray-700 max-w-sm leading-relaxed">{product.description}</td>
                    <td className="px-6 py-5 whitespace-nowrap text-base text-gray-800">
                      {product.salePrice !== null && product.salePrice < product.price ? (
                          <>
                              <span className="line-through text-red-500">₹{product.price.toFixed(2)}</span>
                              <br />
                              <span className="font-bold text-green-600 text-lg">₹{product.salePrice.toFixed(2)}</span>
                          </>
                      ) : (
                          <span className="font-bold text-gray-800 text-lg">₹{product.price.toFixed(2)}</span>
                      )}
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-base text-gray-700">{product.category}</td>
                    <td className="px-6 py-5 whitespace-nowrap text-base text-gray-700">
                      <span className={`px-4 py-1 rounded-full text-sm font-bold ${
                          product.stock > 10 ? 'bg-green-100 text-green-800' :
                          product.stock > 0 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                      }`}>
                          {product.stock} in Stock
                      </span>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-base text-gray-700">
                      {product.reviewCount > 0 ? (
                        <div className="flex items-center">
                          <span className="font-bold text-yellow-600 mr-2 text-lg">{product.averageRating}</span>
                          <div className="flex items-center">
                             {renderStars(product.averageRating)}
                          </div>
                          <span className="ml-3 text-sm text-gray-500">({product.reviewCount} reviews)</span>
                        </div>
                      ) : (
                        <span className="text-gray-500 text-sm">No Reviews</span>
                      )}
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-base font-medium rounded-r-xl">
                      <div className="flex items-center space-x-5">
                        <button
                          onClick={() => navigate(`/admin/edit-product/${product._id}`)}
                          className="text-indigo-600 hover:text-indigo-800 transition-colors duration-200 transform hover:scale-110"
                          title="Edit Product"
                        >
                          <Edit size={24} />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product._id)}
                          className="text-red-600 hover:text-red-800 transition-colors duration-200 transform hover:scale-110"
                          title="Delete Product"
                        >
                          <Trash2 size={24} />
                        </button>
                      </div>
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

export default Products;