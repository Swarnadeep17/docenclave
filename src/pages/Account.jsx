// This page shows user info and a link to /admin if they are an admin.
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/useAuth.js';
import { logout } from '../utils/firebase.js';

const Account = () => {
    const { userProfile, isAdmin } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    if (!userProfile) return <p>Loading...</p>;

    return (
        <div className="container mx-auto max-w-2xl py-12">
            <h1>Account</h1>
            <p>Email: {userProfile.email}</p>
            <p>Plan: {userProfile.plan}</p>
            {isAdmin && <Link to="/admin">Admin Dashboard</Link>}
            <button onClick={handleLogout}>Logout</button>
        </div>
    );
}

export default Account;