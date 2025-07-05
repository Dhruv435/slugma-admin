import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Check, Plus } from 'lucide-react'; // Removed ChevronLeft

// === CRUCIAL FIX: Updated API_BASE_URL to your deployed backend URL ===
const API_BASE_URL = 'https://slugma-backend.vercel.app';

// --- Predefined Data for Select Boxes and Buttons ---
const CATEGORIES = ['Shoes', 'Watch', 'Perfume', 'Belt', 'Bag'];

const MATERIALS_BY_CATEGORY = {
  'Shoes': ['Leather', 'Mesh', 'Canvas', 'Rubber', 'Synthetic', 'Suede'],
  'Watch': ['Stainless Steel', 'Leather', 'Silicone', 'Titanium', 'Plastic', 'Ceramic'],
  'Perfume': ['Glass', 'Plastic', 'Metal', 'Crystal'], // Bottle material
  'Belt': ['Leather', 'Canvas', 'Fabric', 'Synthetic'],
  'Bag': ['Leather', 'Canvas', 'Nylon', 'Polyester', 'Jute', 'Denim'],
  '': ['N/A'] // Default if no category selected
};

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL']; // Common apparel sizes

const COLORS = [
  { name: 'Red', hex: '#EF4444' },
  { name: 'Blue', hex: '#3B82F6' },
  { name: 'Green', hex: '#22C55E' },
  { name: 'Black', hex: '#1A202C' },
  { name: 'White', hex: '#FFFFFF', border: true }, // Add border for white color button
  { name: 'Grey', hex: '#6B7280' },
  { name: 'Orange', hex: '#F97316' },
  { name: 'Pink', hex: '#EC4899' },
  { name: 'Purple', hex: '#8B5CF6' },
  { name: 'Yellow', hex: '#FACC15' },
  { name: 'Brown', hex: '#8B5F42' },
  { name: 'Beige', hex: '#F5F5DC' },
];

const AddProduct = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [form, setForm] = useState({
    name: '', description: '', moreDescription: '', price: '', salePrice: '', category: '',
    size: [], colors: [], image: null, stock: '', sku: '', brand: '', material: '',
    weight: '', length: '', width: '', height: '', tags: [],
  });

  const [currentMaterialOptions, setCurrentMaterialOptions] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentImageUrl, setCurrentImageUrl] = useState('');
  const [isOnSale, setIsOnSale] = useState(false);

  useEffect(() => {
    if (id) {
      setIsEditMode(true);
      const fetchProduct = async () => {
        try {
          const response = await fetch(`${API_BASE_URL}/api/products/${id}`);
          if (!response.ok) {
            throw new Error('Failed to fetch product data');
          }
          const data = await response.json();
          setForm({
            name: data.name || '', description: data.description || '',
            moreDescription: data.moreDescription ? data.moreDescription.join('\n') : '',
            price: data.price || '', salePrice: data.salePrice || '', category: data.category || '',
            size: data.size || [], colors: data.colors || [], image: null,
            stock: data.stock || '', sku: data.sku || '', brand: data.brand || '', material: data.material || '',
            weight: data.weight || '',
            length: data.dimensions?.length || '', width: data.dimensions?.width || '', height: data.dimensions?.height || '',
            tags: data.tags || [],
          });
          setCurrentImageUrl(data.image ? `${API_BASE_URL}${data.image}` : '');
          setIsOnSale(data.salePrice ? true : false);
        } catch (err) {
          console.error('Error fetching product for edit:', err);
          setMessage(`❌ Error loading product: ${err.message}`);
        }
      };
      fetchProduct();
    }
  }, [id]);

  useEffect(() => {
    setCurrentMaterialOptions(MATERIALS_BY_CATEGORY[form.category] || MATERIALS_BY_CATEGORY['']);
    if (form.material && !MATERIALS_BY_CATEGORY[form.category]?.includes(form.material)) {
      setForm(prevForm => ({ ...prevForm, material: '' }));
    }
  }, [form.category, form.material]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleFileChange = (e) => {
    setForm({ ...form, image: e.target.files[0] });
  };

  const handleToggleSize = (size) => {
    setForm(prevForm => {
      const currentSizes = prevForm.size;
      if (currentSizes.includes(size)) {
        return { ...prevForm, size: currentSizes.filter(s => s !== size) };
      } else {
        return { ...prevForm, size: [...currentSizes, size] };
      }
    });
  };

  const handleToggleColor = (colorName) => {
    setForm(prevForm => {
      const currentColors = prevForm.colors;
      if (currentColors.includes(colorName)) {
        return { ...prevForm, colors: currentColors.filter(c => c !== colorName) };
      } else {
        return { ...prevForm, colors: [...currentColors, colorName] };
      }
    });
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !form.tags.includes(tagInput.trim())) {
      setForm({ ...form, tags: [...form.tags, tagInput.trim()] });
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setForm({
      ...form,
      tags: form.tags.filter(tag => tag !== tagToRemove)
    });
  };

  const generateSku = () => {
    if (!isEditMode || !form.sku) {
      const randomSku = Math.random().toString(36).substring(2, 10).toUpperCase();
      setForm(prevForm => ({ ...prevForm, sku: `PROD-${randomSku}` }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage('');

    const nameTrimmed = form.name.trim();
    const descriptionTrimmed = form.description.trim();
    const categoryTrimmed = form.category.trim();
    const priceTrimmed = form.price.toString().trim();
    const stockTrimmed = form.stock.toString().trim();

    if (!nameTrimmed || !descriptionTrimmed || !categoryTrimmed || !priceTrimmed || !stockTrimmed) {
        setMessage('❌ Please fill in all required product details (Name, Description, Category, Price, Stock).');
        setIsSubmitting(false);
        return;
    }

    const priceNum = parseFloat(priceTrimmed);
    if (isNaN(priceNum) || priceNum <= 0) {
        setMessage('❌ Price must be a positive number.');
        setIsSubmitting(false);
        return;
    }

    const stockNum = parseInt(stockTrimmed);
    if (isNaN(stockNum) || stockNum < 0) {
        setMessage('❌ Stock quantity must be a non-negative integer.');
        setIsSubmitting(false);
        return;
    }

    if (isOnSale && form.salePrice !== '') {
      const salePriceNum = parseFloat(form.salePrice);
      if (isNaN(salePriceNum) || salePriceNum < 0) {
          setMessage('❌ Sale price must be a non-negative number.');
          setIsSubmitting(false);
          return;
      }
      if (salePriceNum >= priceNum) {
        setMessage('❌ Sale price must be strictly less than the regular price.');
        setIsSubmitting(false);
        return;
      }
    }

    const formData = new FormData();
    formData.append('name', nameTrimmed);
    formData.append('description', descriptionTrimmed);
    formData.append('price', priceTrimmed);
    formData.append('category', categoryTrimmed);
    formData.append('stock', stockTrimmed);
    formData.append('brand', form.brand || '');
    formData.append('material', form.material || '');
    formData.append('sku', form.sku || '');

    formData.append('moreDescription', form.moreDescription.trim());

    if (isOnSale && form.salePrice !== '') {
        formData.append('salePrice', form.salePrice);
    } else {
        formData.append('salePrice', '');
    }

    form.colors.forEach(color => formData.append('colors[]', color));
    form.size.forEach(s => formData.append('size[]', s));
    form.tags.forEach(tag => formData.append('tags[]', tag));

    formData.append('weight', form.weight !== '' ? parseFloat(form.weight) : 0);
    formData.append('length', form.length !== '' ? parseFloat(form.length) : 0);
    formData.append('width', form.width !== '' ? parseFloat(form.width) : 0);
    formData.append('height', form.height !== '' ? parseFloat(form.height) : 0);

    if (form.image) {
      formData.append('image', form.image);
    }

    const url = isEditMode ? `${API_BASE_URL}/api/products/${id}` : `${API_BASE_URL}/api/products`;
    const method = isEditMode ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method: method,
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Something went wrong!');
      }

      setMessage(`✅ ${result.message}`);
      if (!isEditMode) {
        setForm({
          name: '', description: '', moreDescription: '', price: '', salePrice: '', category: '', size: [],
          colors: [], image: null, stock: '', sku: '', brand: '', material: '',
          weight: '', length: '', width: '', height: '', tags: [],
        });
        setTagInput('');
        setCurrentImageUrl('');
        setIsOnSale(false);
      } else {
        if (form.image) {
             setCurrentImageUrl(result.product.image ? `${API_BASE_URL}${result.product.image}` : '');
        }
        setForm(prevForm => ({
            ...prevForm,
            moreDescription: result.product.moreDescription ? result.product.moreDescription.join('\n') : ''
        }));
      }

    } catch (err) {
      setMessage(`❌ ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="w-full mx-auto bg-white rounded-2xl shadow-xl p-10">
        <h2 className="text-5xl font-extrabold text-gray-900 mb-10 text-center leading-tight">
          {isEditMode ? 'Edit Product Details' : 'Add New Product'}
        </h2>

        {message && (
          <div className={`p-5 mb-8 rounded-lg font-medium text-xl ${message.startsWith('✅') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'} shadow-md`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-10">
          {/* Product Basic Details Section */}
          <section className="p-8 border border-gray-200 rounded-xl bg-gray-50 shadow-sm">
            <h3 className="text-3xl font-bold text-gray-800 mb-6 border-b pb-4 border-gray-200">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-base font-semibold text-gray-700 mb-2">Product Name <span className="text-red-500">*</span></label>
                <input type="text" id="name" name="name" value={form.name} onChange={handleChange}
                  className="w-full p-4 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-200 text-lg" required />
              </div>
              <div>
                <label htmlFor="category" className="block text-base font-semibold text-gray-700 mb-2">Category <span className="text-red-500">*</span></label>
                <select id="category" name="category" value={form.category} onChange={handleChange}
                  className="w-full p-4 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white appearance-none transition duration-200 text-lg" required>
                  <option value="">Select a Category</option>
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2">
                <label htmlFor="description" className="block text-base font-semibold text-gray-700 mb-2">Short Description <span className="text-red-500">*</span></label>
                <textarea id="description" name="description" value={form.description} onChange={handleChange} rows="4"
                  className="w-full p-4 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 resize-y transition duration-200 text-lg" required />
              </div>
              <div className="md:col-span-2">
                <label htmlFor="moreDescription" className="block text-base font-semibold text-gray-700 mb-2">Detailed Features (One point per line)</label>
                <textarea id="moreDescription" name="moreDescription" value={form.moreDescription} onChange={handleChange} rows="6"
                  className="w-full p-4 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 resize-y transition duration-200 text-lg"
                  placeholder={`Example:
- Crafted from premium materials
- Ergonomic design for comfort
- Water-resistant up to 50 meters`}
                />
              </div>
            </div>
          </section>

          {/* Pricing & Stock Section */}
          <section className="p-8 border border-gray-200 rounded-xl bg-gray-50 shadow-sm">
            <h3 className="text-3xl font-bold text-gray-800 mb-6 border-b pb-4 border-gray-200">Pricing & Inventory</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="price" className="block text-base font-semibold text-gray-700 mb-2">Price (₹) <span className="text-red-500">*</span></label>
                <input type="number" id="price" name="price" value={form.price} onChange={handleChange} step="0.01"
                  className="w-full p-4 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-200 text-lg" required min="0"/>
              </div>
              <div>
                <div className="flex items-center mb-2">
                  <input type="checkbox" id="isOnSale" checked={isOnSale} onChange={() => setIsOnSale(!isOnSale)}
                         className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-3 cursor-pointer" />
                  <label htmlFor="isOnSale" className="text-base font-semibold text-gray-700">Apply Sale Price</label>
                </div>
                {isOnSale && (
                  <>
                    <label htmlFor="salePrice" className="block text-base font-semibold text-gray-700 mb-2">Sale Price (₹)</label>
                    <input type="number" id="salePrice" name="salePrice" value={form.salePrice} onChange={handleChange} step="0.01"
                           className="w-full p-4 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-200 text-lg" min="0" />
                  </>
                )}
                {form.price !== '' && form.salePrice !== '' && isOnSale && (
                    <p className={`text-sm mt-3 ${parseFloat(form.salePrice) < parseFloat(form.price) ? 'text-green-600' : 'text-red-500'}`}>
                      Original: <span className="line-through">₹{parseFloat(form.price).toFixed(2)}</span>
                      {' '}Sale: <span className="font-bold">₹{parseFloat(form.salePrice).toFixed(2)}</span>
                      {parseFloat(form.salePrice) >= parseFloat(form.price) && " (Sale price must be less than regular price)"}
                    </p>
                )}
              </div>
              <div>
                <label htmlFor="stock" className="block text-base font-semibold text-gray-700 mb-2">Stock Quantity <span className="text-red-500">*</span></label>
                <input type="number" id="stock" name="stock" value={form.stock} onChange={handleChange}
                  className="w-full p-4 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-200 text-lg" required min="0"/>
              </div>
              <div className="flex items-end gap-4">
                <div className="flex-grow">
                  <label htmlFor="sku" className="block text-base font-semibold text-gray-700 mb-2">SKU (Optional, Unique)</label>
                  <input type="text" id="sku" name="sku" value={form.sku} onChange={handleChange}
                    className="w-full p-4 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-200 text-lg" />
                </div>
                <button
                  type="button"
                  onClick={generateSku}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors duration-200 text-base font-medium shadow-sm"
                  title="Auto-generate SKU"
                >
                  Generate SKU
                </button>
              </div>
            </div>
          </section>

          {/* Attributes Section */}
          <section className="p-8 border border-gray-200 rounded-xl bg-gray-50 shadow-sm">
            <h3 className="text-3xl font-bold text-gray-800 mb-6 border-b pb-4 border-gray-200">Attributes</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="brand" className="block text-base font-semibold text-gray-700 mb-2">Brand</label>
                <input type="text" id="brand" name="brand" value={form.brand} onChange={handleChange}
                  className="w-full p-4 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-200 text-lg" />
              </div>
              <div>
                <label htmlFor="material" className="block text-base font-semibold text-gray-700 mb-2">Material {form.category && <span className="text-red-500">*</span>}</label>
                <select id="material" name="material" value={form.material} onChange={handleChange}
                  className="w-full p-4 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white appearance-none transition duration-200 text-lg"
                  disabled={!form.category}
                  required={form.category !== ''}
                >
                  <option value="">Select Material</option>
                  {currentMaterialOptions.map(mat => (
                    <option key={mat} value={mat}>{mat}</option>
                  ))}
                </select>
                {!form.category && <p className="text-sm text-gray-500 mt-2">Select a category first to choose material options.</p>}
              </div>
            </div>

            {/* Sizes as Buttons */}
            <div className="mt-8">
              <label className="block text-base font-semibold text-gray-700 mb-3">Available Sizes (Select multiple)</label>
              <div className="flex flex-wrap gap-3">
                {SIZES.map(s => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => handleToggleSize(s)}
                    className={`px-6 py-3 rounded-full border-2 font-medium text-lg transition-colors duration-200 shadow-sm
                      ${form.size.includes(s)
                        ? 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                      }`
                    }
                  >
                    {s}
                    {form.size.includes(s) && <Check size={18} className="inline-block ml-3" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Colors as Buttons with Checkmark */}
            <div className="mt-8">
              <label className="block text-base font-semibold text-gray-700 mb-3">Available Colors (Select multiple)</label>
              <div className="flex flex-wrap gap-3">
                {COLORS.map(color => (
                  <button
                    key={color.name}
                    type="button"
                    onClick={() => handleToggleColor(color.name)}
                    className={`relative w-12 h-12 rounded-full flex items-center justify-center border-2 shadow-sm
                      ${form.colors.includes(color.name) ? 'border-blue-600 ring-2 ring-blue-500' : (color.border ? 'border-gray-300' : 'border-transparent hover:border-gray-400')}`
                    }
                    style={{ backgroundColor: color.hex }}
                    title={color.name}
                  >
                    {form.colors.includes(color.name) && (
                      <Check size={22} className="text-white drop-shadow-[0_0px_3px_rgba(0,0,0,0.8)]" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Dimensions & Weight Section */}
          <section className="p-8 border border-gray-200 rounded-xl bg-gray-50 shadow-sm">
            <h3 className="text-3xl font-bold text-gray-800 mb-6 border-b pb-4 border-gray-200">Shipping Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label htmlFor="length" className="block text-base font-semibold text-gray-700 mb-2">Length (cm)</label>
                <input type="number" id="length" name="length" value={form.length} onChange={handleChange} step="0.01"
                  className="w-full p-4 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-200 text-lg" min="0"/>
              </div>
              <div>
                <label htmlFor="width" className="block text-base font-semibold text-gray-700 mb-2">Width (cm)</label>
                <input type="number" id="width" name="width" value={form.width} onChange={handleChange} step="0.01"
                  className="w-full p-4 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-200 text-lg" min="0"/>
              </div>
              <div>
                <label htmlFor="height" className="block text-base font-semibold text-gray-700 mb-2">Height (cm)</label>
                <input type="number" id="height" name="height" value={form.height} onChange={handleChange} step="0.01"
                  className="w-full p-4 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-200 text-lg" min="0"/>
              </div>
            </div>
            <div className="mt-6">
              <label htmlFor="weight" className="block text-base font-semibold text-gray-700 mb-2">Weight (Gram)</label>
              <input type="number" id="weight" name="weight" value={form.weight} onChange={handleChange} step="0.01"
                className="w-full p-4 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-200 text-lg" min="0"/>
            </div>
          </section>

          {/* Tags Section */}
          <section className="p-8 border border-gray-200 rounded-xl bg-gray-50 shadow-sm">
            <h3 className="text-3xl font-bold text-gray-800 mb-6 border-b pb-4 border-gray-200">Search Tags</h3>
            <label className="block text-base font-semibold text-gray-700 mb-3">Add Keywords for better searchability</label>
            <div className="flex items-center space-x-4 mb-4">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddTag(); } }}
                placeholder="Type a tag and press Enter or click Add"
                className="flex-grow p-4 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-200 text-lg"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium text-lg hover:bg-blue-700 transition-colors duration-200 flex items-center shadow-md"
                title="Add Tag"
              >
                <Plus size={20} className="mr-2" /> Add
              </button>
            </div>
            <div className="flex flex-wrap gap-3">
              {form.tags.length > 0 ? (
                form.tags.map((tag, index) => (
                  <span key={index} className="inline-flex items-center px-4 py-2 rounded-full text-base font-medium bg-green-100 text-green-800 shadow-sm">
                    {tag}
                    <button type="button" onClick={() => handleRemoveTag(tag)} className="ml-3 -mr-1 bg-green-200 text-green-900 rounded-full p-1 hover:bg-green-300 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </span>
                ))
              ) : (
                <p className="text-gray-500 text-lg italic">No tags added yet. Tags help customers find your product!</p>
              )}
            </div>
          </section>

          {/* Product Image Section */}
          <section className="p-8 border border-gray-200 rounded-xl bg-gray-50 shadow-sm">
            <h3 className="text-3xl font-bold text-gray-800 mb-6 border-b pb-4 border-gray-200">Product Image</h3>
            <label htmlFor="image" className="block text-base font-semibold text-gray-700 mb-3">Upload Product Image</label>
            <input type="file" id="image" accept="image/*" onChange={handleFileChange}
              className="w-full text-lg file:mr-4 file:py-3 file:px-6 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition duration-200 cursor-pointer" />
            {(isEditMode && currentImageUrl) && (
              <div className="mt-6">
                <p className="text-base text-gray-700 mb-3 font-medium">Current Product Image:</p>
                <img src={currentImageUrl} alt="Current Product" className="w-40 h-40 object-cover rounded-lg border border-gray-300 shadow-md" />
              </div>
            )}
          </section>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-xl hover:bg-blue-700 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg transform hover:scale-105"
            disabled={isSubmitting}
          >
            {isSubmitting ? (isEditMode ? 'Updating Product...' : 'Adding Product...') : (isEditMode ? 'Update Product' : 'Add Product')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddProduct;
