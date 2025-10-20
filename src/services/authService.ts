import { supabase } from '@/lib/supabase'

export interface UserCredentials {
  email: string
  password: string
}

export interface AuthResponse {
  user: any | null
  session: any | null
  error: Error | null
}

export const authService = {
  async signIn(credentials: UserCredentials): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      })

      if (error) throw error

      return {
        user: data.user,
        session: data.session,
        error: null,
      }
    } catch (error: any) {
      return {
        user: null,
        session: null,
        error,
      }
    }
  },

  async signUp(credentials: UserCredentials): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: credentials.email,
        password: credentials.password,
      })

      if (error) throw error

      return {
        user: data.user,
        session: data.session,
        error: null,
      }
    } catch (error: any) {
      return {
        user: null,
        session: null,
        error,
      }
    }
  },

  async signOut(): Promise<{ error: Error | null }> {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      return { error: null }
    } catch (error: any) {
      return { error }
    }
  },

  async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser()
    return user
  }
}