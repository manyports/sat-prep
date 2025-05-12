import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

const protectedPathPrefixes = ['/profile', '/assignments'];

const instructorPathPrefixes = [
  '/assignments/[classId]/test-selection',
  '/assignments/[classId]/test-analytics',
  '/assignments/[classId]/test-studio'
];

const authPathPrefixes = ['/auth/signin', '/auth/signup'];

const publicApiPaths = ['/api/auth/'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  if (
    pathname.startsWith('/_next') || 
    pathname.startsWith('/static') ||
    pathname.includes('.') ||
    publicApiPaths.some(path => pathname.startsWith(path))
  ) {
    return NextResponse.next();
  }

  const isProtectedPath = protectedPathPrefixes.some((path) => pathname.startsWith(path));
  const isAuthPath = authPathPrefixes.some((path) => pathname.startsWith(path));
  
  const isInstructorPath = instructorPathPrefixes.some((path) => {
    const pathPattern = path.replace(/\[[\w-]+\]/g, '[\\w-]+');
    const regex = new RegExp(`^${pathPattern}`);
    return regex.test(pathname);
  });
  
  if (!isProtectedPath && !isAuthPath) {
    return NextResponse.next();
  }

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (isProtectedPath && !token) {
    const url = new URL('/auth/signin', request.url);
    url.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(url);
  }

  if (isAuthPath && token) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  if (isInstructorPath && token) {
    try {
      const classIdMatch = pathname.match(/\/assignments\/([^\/]+)/);
      const classId = classIdMatch ? classIdMatch[1] : null;
      
      if (!classId) {
        console.error('Failed to extract classId from path:', pathname);
        return NextResponse.rewrite(new URL('/access-denied', request.url));
      }
      
      const userId = token.sub;
      
      const apiUrl = `/api/classes/${classId}`;
      
      const response = await fetch(
        new URL(apiUrl, request.url).toString(),
        {
          headers: {
            'Content-Type': 'application/json',
            'Cookie': request.headers.get('cookie') || '' 
          }
        }
      );
      
      if (!response.ok) {
        console.error('Failed to fetch class data:', response.status);
        return NextResponse.rewrite(new URL('/access-denied', request.url));
      }
      
      const data = await response.json();
      
      if (data.success && data.class) {
        const instructorId = String(data.class.instructor.id || data.class.instructor);
        const currentUserId = String(userId);
        
        const isInstructor = instructorId === currentUserId;
        
        if (!isInstructor) {
          return NextResponse.rewrite(new URL('/access-denied', request.url));
        }
      } else {
        console.error('Class data not found or error in response:', data);
        return NextResponse.rewrite(new URL('/access-denied', request.url));
      }
    } catch (error) {
      console.error('Error checking instructor status:', error);
      return NextResponse.rewrite(new URL('/access-denied', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/profile/:path*',
    '/assignments/:path*',
    '/auth/signin',
    '/auth/signup',
    '/assignments/[classId]/test-analytics/[testId]',
    '/assignments/[classId]/test-selection',
    '/assignments/[classId]/test-studio',
    '/assignments/[classId]/test-analytics',
    '/assignments/[classId]/test-studio'
  ],
}; 