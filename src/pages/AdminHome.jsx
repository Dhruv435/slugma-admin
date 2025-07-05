import React from 'react';
import Header from '../components/Header';

const AdminHome = () => {
  return (
    <div>
      <Header />
      <main className="p-6">
        <h2 className="text-2xl font-bold">Welcome to the Admin Dashboard</h2>
      </main>
    </div>
  );
};

export default AdminHome;
