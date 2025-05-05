'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Grid, GridItem } from "@/components/grid";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { UserPlus } from "lucide-react";

export default function SignUp() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Registration successful! Redirecting to sign in...');
        
        setFormData({
          name: '',
          email: '',
          password: '',
          confirmPassword: '',
        });

        setTimeout(() => {
          router.push('/auth/signin');
        }, 2000);
      } else {
        let errorCode;
        switch (data.message) {
          case 'User with this email already exists':
            errorCode = 'UserExists';
            break;
          case 'Missing required fields':
            errorCode = 'MissingFields';
            break;
          default:
            errorCode = 'CredentialsSignup';
        }
        
        router.push(`/auth/error?error=${errorCode}`);
      }
    } catch (error: any) {
      router.push('/auth/error?error=DatabaseError');
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
              <h1 className="text-5xl font-bold text-white mb-4">Join Satley</h1>
              <p className="text-blue-100 text-lg mb-8">Create your account to start preparing for the SAT</p>
              <div className="mt-auto">
                <p className="text-blue-200 text-sm">
                  Already have an account?
                </p>
                <Link 
                  href="/auth/signin" 
                  className="text-white font-medium hover:underline flex items-center mt-2"
                >
                  Sign in →
                </Link>
              </div>
            </div>
          </GridItem>
          <GridItem className="p-8 sm:p-16 min-h-[400px] md:min-h-[600px] flex flex-col justify-center">
            <div className="max-w-md mx-auto w-full">
              <div className="mb-8 md:hidden">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h1>
                <p className="text-gray-600">Join Satley's SAT preparation platform</p>
              </div>
              {error && (
                <div className="mb-6 md:mb-8 p-3 bg-red-50 border-l-4 border-red-500 text-sm text-red-800">
                  {error}
                </div>
              )}
              {success && (
                <div className="mb-6 md:mb-8 p-3 bg-green-50 border-l-4 border-green-500 text-sm text-green-800">
                  {success}
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-5 md:space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-3 py-2 md:py-3 border-b-2 border-gray-200 focus:outline-none focus:border-blue-900"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-3 py-2 md:py-3 border-b-2 border-gray-200 focus:outline-none focus:border-blue-900"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full px-3 py-2 md:py-3 border-b-2 border-gray-200 focus:outline-none focus:border-blue-900"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Must be at least 6 characters
                  </p>
                </div>
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm Password
                  </label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
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
                    <Spinner label="Creating account..." />
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Create Account
                    </>
                  )}
                </Button>
              </form>
              <div className="mt-8 pt-6 border-t border-gray-100 text-center md:hidden">
                <p className="text-sm text-gray-600">
                  Already have an account?{' '}
                  <Link href="/auth/signin" className="text-blue-900 hover:text-blue-700 font-medium">
                    Sign in
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