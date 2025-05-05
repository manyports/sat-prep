'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Grid, GridItem } from "@/components/grid";
import { Button } from "@/components/ui/button";
import { AlertCircle, ArrowLeft, Loader2 } from "lucide-react";

function ErrorContent() {
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const errorMessage = searchParams.get('error');
    setError(errorMessage);
  }, [searchParams]);

  const getErrorMessage = (errorCode: string | null) => {
    switch (errorCode) {
      case 'CredentialsSignin':
        return 'Invalid email or password. Please try again.';
      case 'SessionRequired':
        return 'You need to be signed in to access this page.';
      case 'Verification':
        return 'The verification link is invalid or has expired.';
      case 'AccessDenied':
        return 'You don\'t have permission to access this resource.';
      case 'AccountNotLinked':
        return 'This account is not linked with your existing credentials.';
      case 'UserExists':
        return 'An account with this email already exists. Please sign in instead.';
      case 'MissingFields':
        return 'Please fill in all required fields to create your account.';
      case 'CredentialsSignup':
        return 'There was a problem creating your account. Please try again.';
      case 'UserNotFound':
        return 'No account found with this email. Please check your email or sign up.';
      case 'InvalidPassword':
        return 'The password you entered is incorrect. Please try again.';
      case 'MissingCredentials':
        return 'Please enter both your email and password to sign in.';
      case 'UnknownError':
        return 'An unexpected error occurred during authentication.';
      case 'DatabaseError':
        return 'We couldn\'t connect to our services. Please try again later.';
      
      case 'OAuthSignin':
      case 'OAuthCallback':
      case 'OAuthCreateAccount':
      case 'EmailCreateAccount':
      case 'Callback':
      case 'EmailSignin':
        return 'There was a problem with the authentication service. Please try again.';
        
      default:
        return 'An unknown error occurred. Please try again or contact support if the problem persists.';
    }
  };

  const getActionButton = (errorCode: string | null) => {
    if (['UserExists', 'MissingFields', 'CredentialsSignup'].includes(errorCode || '')) {
      return (
        <Button
          asChild
          className="w-full bg-blue-900 hover:bg-blue-800 text-white rounded-none py-3 mb-4"
        >
          <Link href="/auth/signup">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Sign Up
          </Link>
        </Button>
      );
    }

    return (
      <Button
        asChild
        className="w-full bg-blue-900 hover:bg-blue-800 text-white rounded-none py-3 mb-4"
      >
        <Link href="/auth/signin">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Sign In
        </Link>
      </Button>
    );
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
      <div className="container max-w-6xl mx-auto px-4 sm:px-6">
        <Grid columns={2} noBorder="none" className="shadow-xl">
          <GridItem className="hidden md:flex flex-col justify-center p-16 bg-red-600 min-h-[600px]">
            <div className="max-w-md">
              <h1 className="text-5xl font-bold text-white mb-4">Authentication Error</h1>
              <p className="text-red-100 text-lg">We encountered a problem with your sign-in</p>
            </div>
          </GridItem>
          <GridItem className="p-8 sm:p-16 min-h-[400px] md:min-h-[600px] flex flex-col justify-center">
            <div className="max-w-md mx-auto w-full">
              <div className="mb-8 md:hidden">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Authentication Error</h1>
                <p className="text-gray-600">We encountered a problem</p>
              </div>
              <div className="flex items-start p-4 bg-red-50 border-l-4 border-red-500 text-sm text-red-800 mb-8 md:mb-10">
                <AlertCircle className="h-5 w-5 flex-shrink-0 mr-3 mt-0.5 text-red-500" />
                <p>{getErrorMessage(error)}</p>
              </div>
              <div className="space-y-4 md:space-y-6">
                {getActionButton(error)}
                <Button
                  asChild
                  variant="outline"
                  className="w-full border-gray-200 hover:bg-gray-50 text-gray-700"
                >
                  <Link href="/">
                    Return to Home
                  </Link>
                </Button>
              </div>
            </div>
          </GridItem>
        </Grid>
      </div>
    </div>
  );
}

function ErrorContentFallback() {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
      <div className="flex flex-col items-center">
        <Loader2 className="h-8 w-8 text-blue-900 animate-spin mb-4" />
        <p className="text-gray-600">Loading error information...</p>
      </div>
    </div>
  );
}

export default function AuthError() {
  return (
    <Suspense fallback={<ErrorContentFallback />}>
      <ErrorContent />
    </Suspense>
  );
} 