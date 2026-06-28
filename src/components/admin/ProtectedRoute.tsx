import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { motion } from 'framer-motion';

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          navigate('/admin');
          setLoading(false);
          return;
        }

        const userEmail = session.user?.email?.toLowerCase();
        if (!userEmail) {
          await supabase.auth.signOut();
          navigate('/admin');
          setLoading(false);
          return;
        }

        const allowedEmails = [
          'admin@creastora.com',
          'crestorastudios@gmail.com',
          'pavitthiran66@gmail.com'
        ];

        if (!allowedEmails.includes(userEmail)) {
          console.warn(`Unauthorized dashboard access attempt by ${userEmail}`);
          await supabase.auth.signOut();
          navigate('/admin');
        } else {
          setAuthenticated(true);
        }
      } catch (err) {
        console.error("Auth verification failed:", err);
        navigate('/admin');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!session) {
        navigate('/admin');
        setAuthenticated(false);
      } else {
        const userEmail = session.user?.email?.toLowerCase();
        if (!userEmail) {
          await supabase.auth.signOut();
          navigate('/admin');
          setAuthenticated(false);
          return;
        }

        const allowedEmails = [
          'admin@creastora.com',
          'crestorastudios@gmail.com',
          'pavitthiran66@gmail.com'
        ];

        if (!allowedEmails.includes(userEmail)) {
          await supabase.auth.signOut();
          navigate('/admin');
          setAuthenticated(false);
        } else {
          setAuthenticated(true);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-white">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-4 border-black/10 border-t-black rounded-full"
        />
      </div>
    );
  }

  return authenticated ? <>{children}</> : null;
};
