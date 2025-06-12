import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/useAuth.js';
import { logout } from '../utils/firebase.js';

const Account = () => {
    const { currentUser, userProfile, isAdmin, loading } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/');
        } catch (error) {
            console.error("Failed to log out", error);
        }
    };

    if (loading) {
        return <div className="text-center py-10">Loading account...</div>;
    }
    
    if (!currentUser) {
        navigate('/login');
        return null;
    }

    return (
        <div className="container mx-auto max-w-2xl px-4 py-12">
            <div className="bg-dark-secondary rounded-xl p-8 border border-dark-border">
                <h1 className="text-3xl font-bold text-dark-text-primary mb-6">My Account</h1>
                {userProfile ? (
                    <div className="space-y-4">
                        <p><span className="font-semibold text-dark-text-secondary">Email:</span> {userProfile.email}</p>
                        <p><span className="font-semibold text-dark-text-secondary">Plan:</span> <span className="bg-dark-tertiary px-2 py-1 rounded-md text-sm">{userProfile.plan}</span></p>
                        {isAdmin && (
                            <Link to="/admin" className="inline-block bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors">
                                Go to Admin Dashboard
                            </Link>
                        )}
                    </div>
                ) : (
                    <p>Loading profile...</p>
                )}
                <button 
                    onClick={handleLogout} 
                    className="mt-8 border border-red-500/50 text-red-400 px-4 py-2 rounded-lg hover:bg-red-500/10 transition-colors"
                >
                    Logout
                </button>
            </div>
        </div>
    );
}

export default Account;