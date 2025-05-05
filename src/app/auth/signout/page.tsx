'use client';

import { useEffect, useState } from 'react';
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Grid, GridItem } from "@/components/grid";
import { LogOut, Check } from "lucide-react";

export default function SignOut() {
  const router = useRouter();
  const [status, setStatus] = useState<'signing-out' | 'completed'>('signing-out');

  useEffect(() => {
    let redirectTimer: NodeJS.Timeout;

    const performSignOut = async () => {
      try {
        await signOut({ redirect: false });
        setStatus('completed');
        
        redirectTimer = setTimeout(() => {
          router.push('/');
        }, 2000);
      } catch (error) {
        console.error('Error signing out:', error);
        redirectTimer = setTimeout(() => {
          router.push('/');
        }, 2000);
      }
    };

    performSignOut();

    return () => {
      if (redirectTimer) clearTimeout(redirectTimer);
    };
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
      <div className="container max-w-6xl mx-auto px-4 sm:px-6">
        <Grid columns={2} noBorder="none" className="shadow-xl">
          <GridItem className="hidden md:flex flex-col justify-center p-16 bg-blue-900 min-h-[600px]">
            <div className="max-w-md">
              <h1 className="text-5xl font-bold text-white mb-4">Signing Out</h1>
              <p className="text-blue-100 text-lg">Thank you for using Satley</p>
            </div>
          </GridItem>
          <GridItem className="p-8 sm:p-16 min-h-[400px] md:min-h-[600px] flex flex-col items-center justify-center">
            <div className="text-center">
              <div className="mb-8 md:hidden">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Signing Out</h1>
                <p className="text-gray-600">Please wait a moment...</p>
              </div>
              <div className="w-16 md:w-20 h-16 md:h-20 bg-blue-50 flex items-center justify-center mb-8 md:mb-10 mx-auto rounded-full">
                {status === 'signing-out' ? (
                  <LogOut className="h-8 md:h-10 w-8 md:w-10 text-blue-900" />
                ) : (
                  <Check className="h-8 md:h-10 w-8 md:w-10 text-green-600" />
                )}
              </div>
              <h2 className="text-xl md:text-2xl font-medium text-gray-900 mb-4 md:mb-6">
                {status === 'signing-out' 
                  ? 'Securely signing you out...' 
                  : 'Successfully signed out!'}
              </h2>
              {status === 'signing-out' && (
                <div className="mt-6 md:mt-8 flex justify-center">
                  <div className="inline-block h-8 md:h-10 w-8 md:w-10 animate-spin rounded-full border-4 border-solid border-gray-200 border-r-blue-900">
                    <span className="sr-only">Loading...</span>
                  </div>
                </div>
              )}
              {status === 'completed' && (
                <p className="text-gray-600">Redirecting you to the home page...</p>
              )}
            </div>
          </GridItem>
        </Grid>
      </div>
    </div>
  );
} 