"use client";

import React, { useEffect, useMemo } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useProfile } from "@/hooks/use-auth";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { clearUser, selectIsAuthenticated } from "@/store/slices/userSlice";
import {
  fetchSubscriptionInfo,
  clearSubscriptionInfo,
} from "@/store/slices/subscriptionSlice";
import { IconLoader2 } from "@tabler/icons-react";

// Authentication-related paths that don't require login (but logged-in users should be redirected away)
const AUTH_PATHS = ["/login", "/register", "/forgot-password"];

// Marketing/public pages that should be accessible without login
const PUBLIC_MARKETING_PATHS = ["/", "/about", "/pricing"];

// Check if path is a public path (landing page, auth pages, or marketing pages)
const isPublicPath = (pathname: string): boolean => {
  // Check exact matches for auth and marketing paths
  if (AUTH_PATHS.includes(pathname) || PUBLIC_MARKETING_PATHS.includes(pathname)) {
    return true;
  }
  
  // Check if it's a blog path (all blog pages are public)
  if (pathname.startsWith("/blog")) {
    return true;
  }
  
  return false;
};

// Check if path is a docs route (may be public if shareEnabled)
const isDocsPath = (pathname: string) => {
  return pathname.startsWith("/docs/");
};

// Check if path is an embed route (always public - used for export screenshots)
const isEmbedPath = (pathname: string) => {
  return pathname.startsWith("/embed/");
};

// Check if path is a preview route (publicly accessible, internal auth logic handles privacy)
const isPreviewPath = (pathname: string) => {
  return pathname.startsWith("/preview/");
};

// Check if path requires authentication to view
const isProtectedPath = (pathname: string): boolean => {
  return !isPublicPath(pathname) && !isDocsPath(pathname) && !isEmbedPath(pathname) && !isPreviewPath(pathname);
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  const { isLoading, data: user } = useProfile();

  // Memoize path checks to avoid recalculating on every render
  const pathInfo = useMemo(() => ({
    isPublic: isPublicPath(pathname),
    isProtected: isProtectedPath(pathname),
    isDocs: isDocsPath(pathname),
    isEmbed: isEmbedPath(pathname),
    isAuthPage: AUTH_PATHS.includes(pathname),
  }), [pathname]);

  // Handle authentication redirects
  useEffect(() => {
    if (!isLoading) {
      if (!user && pathInfo.isProtected) {
        // User is not logged in and trying to access a protected page
        dispatch(clearUser());
        dispatch(clearSubscriptionInfo());
        router.push("/login");
      } else if (user && pathInfo.isAuthPage) {
        // User is logged in but on an auth page (login/register/forgot-password), redirect to home
        router.push("/home");
      }
    }
  }, [user, isLoading, pathInfo, router, dispatch]);

  // Handle subscription fetching when auth status changes
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchSubscriptionInfo());
    }
  }, [isAuthenticated, dispatch]);

  // Determine what to render based on auth state and path type
  const shouldShowLoadingState = useMemo(() => {
    // Always show loading while auth check is in progress for protected paths
    if (isLoading && pathInfo.isProtected) {
      return true;
    }

    // Show loading state while redirecting unauthenticated users from protected pages
    // This prevents the flash of protected content before redirect
    if (!isLoading && !user && pathInfo.isProtected) {
      return true;
    }

    return false;
  }, [isLoading, user, pathInfo.isProtected]);

  // Show loading state for protected routes while checking auth or while redirecting
  if (shouldShowLoadingState) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <IconLoader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
          <p className="text-sm font-medium text-muted-foreground animate-pulse">
            {isLoading ? "Authenticating..." : "Redirecting..."}
          </p>
        </div>
      </div>
    );
  }

  // For public paths, docs paths, embed paths, or authenticated users on protected paths - render content
  return <>{children}</>;
};

