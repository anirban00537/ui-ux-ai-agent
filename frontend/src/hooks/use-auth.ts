"use client";

import { useRouter } from "next/navigation";
import { useAppDispatch } from "@/store/hooks";
import { setUser, clearUser } from "@/store/slices/userSlice";
import { authClient } from "@/lib/auth-client";
import { useCallback, useEffect, useMemo } from "react";

/**
 * Serializes user data by converting Date objects to ISO strings.
 * This ensures Redux state remains serializable.
 */
function serializeUser(user: Record<string, unknown>): Record<string, unknown> {
  const serialized: Record<string, unknown> = {};
  
  for (const [key, value] of Object.entries(user)) {
    if (value instanceof Date) {
      serialized[key] = value.toISOString();
    } else if (value && typeof value === 'object' && 'toISOString' in value) {
      // Handle date-like objects (e.g., from some ORMs)
      serialized[key] = (value as { toISOString: () => string }).toISOString();
    } else if (value && typeof value === 'object' && !Array.isArray(value)) {
      // Recursively serialize nested objects
      serialized[key] = serializeUser(value as Record<string, unknown>);
    } else {
      serialized[key] = value;
    }
  }
  
  return serialized;
}

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();

  const handleGoogleLogin = useCallback(
    async () => {
      try {
        await authClient.signIn.social({
          provider: "google",
          callbackURL: `${window.location.origin}/home`,
        });
      } catch (error: unknown) {
        console.error("Google login error:", error);
        throw error;
      }
    },
    []
  );

  return {
    handleGoogleLogin,
    isLoading: false,
    error: null,
  };
};

export const useProfile = () => {
  const dispatch = useAppDispatch();
  const { data: session, isPending, error } = authClient.useSession();

  // Memoize serialized user to avoid unnecessary re-renders
  const serializedUser = useMemo(() => {
    if (!session?.user) return null;
    return serializeUser(session.user as Record<string, unknown>);
  }, [session?.user]);

  useEffect(() => {
    if (serializedUser) {
      dispatch(setUser(serializedUser as Parameters<typeof setUser>[0]));
    } else if (!isPending && !session) {
      dispatch(clearUser());
    }
  }, [serializedUser, isPending, session, dispatch]);

  return {
    data: session?.user,
    isLoading: isPending,
    error
  };
};

export const useSignOut = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();

  const signOut = useCallback(async () => {
    try {
      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            dispatch(clearUser());
            router.push("/login");
          }
        }
      });
    } catch (error: unknown) {
      console.error("Sign out error:", error);
      // Even if sign out fails, clear local state
      dispatch(clearUser());
      router.push("/login");
    }
  }, [dispatch, router]);

  return {
    mutate: signOut,
    isPending: false,
  };
};
