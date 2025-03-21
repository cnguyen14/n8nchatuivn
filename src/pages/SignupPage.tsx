import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import SignupForm from '../components/auth/SignupForm';

const SignupPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuthStore();
  
  useEffect(() => {
    if (user && !loading) {
      navigate('/');
    }
  }, [user, loading, navigate]);
  
  return <SignupForm />;
};

export default SignupPage;
