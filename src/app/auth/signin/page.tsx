'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Grid, GridItem } from "@/components/grid";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { LogIn } from "lucide-react";

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });

      if (result?.error) {
        let errorCode;
        switch (result.error) {
          case 'No user found with this email':
            errorCode = 'UserNotFound';
            break;
          case 'Invalid password':
            errorCode = 'InvalidPassword';
            break;
          case 'Please provide both email and password':
            errorCode = 'MissingCredentials';
            break;
          default:
            errorCode = 'CredentialsSignin';
        }
        
        router.push(`/auth/error?error=${errorCode}`);
      } else {
        router.push('/');
        router.refresh();
      }
    } catch (error) {
      router.push('/auth/error?error=UnknownError');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
      <div className="container max-w-6xl mx-auto px-4 sm:px-6">
        <Grid columns={2} noBorder="none" className="shadow-xl">
          <GridItem className="hidden md:flex flex-col justify-center p-16 bg-blue-900 min-h-[600px]">
            <div className="max-w-md">
              <h1 className="text-5xl font-bold text-white mb-4">Welcome Back</h1>
              <p className="text-blue-100 text-lg mb-8">Sign in to your Satley account</p>
              <div className="mt-auto">
                <p className="text-blue-200 text-sm">
                  Don't have an account?
                </p>
                <Link 
                  href="/auth/signup" 
                  className="text-white font-medium hover:underline flex items-center mt-2"
                >
                  Create account →
                </Link>
              </div>
            </div>
          </GridItem>
          <GridItem className="p-8 sm:p-16 min-h-[400px] md:min-h-[600px] flex flex-col justify-center">
            <div className="max-w-md mx-auto w-full">
              <div className="mb-8 md:hidden">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Sign In</h1>
                <p className="text-gray-600">Welcome back to Satley</p>
              </div>
              {error && (
                <div className="mb-8 p-3 bg-red-50 border-l-4 border-red-500 text-sm text-red-800">
                  {error}
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 md:py-3 border-b-2 border-gray-200 focus:outline-none focus:border-blue-900"
                    required
                  />
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                      Password
                    </label>
                    <Link href="/auth/forgot-password" className="text-sm text-blue-900 hover:text-blue-700">
                      Forgot password?
                    </Link>
                  </div>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2 md:py-3 border-b-2 border-gray-200 focus:outline-none focus:border-blue-900"
                    required
                  />
                </div>
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-4 md:mt-6 bg-blue-900 hover:bg-blue-800 text-white rounded-none py-3"
                >
                  {loading ? (
                    <Spinner label="Signing in..." />
                  ) : (
                    <>
                      <LogIn className="h-4 w-4 mr-2" />
                      Sign In
                    </>
                  )}
                </Button>
              </form>
              <div className="mt-8 pt-6 border-t border-gray-100 text-center md:hidden">
                <p className="text-sm text-gray-600">
                  Don't have an account?{' '}
                  <Link href="/auth/signup" className="text-blue-900 hover:text-blue-700 font-medium">
                    Sign up
                  </Link>
                </p>
              </div>
            </div>
          </GridItem>
        </Grid>
      </div>
    </div>
  );
} 