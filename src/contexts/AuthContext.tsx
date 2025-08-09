import React, { createContext, useContext, useState } from 'react'

interface AuthContextType {
  user: any | null
  loading: boolean
  signIn: () => Promise<void>
  signUp: () => Promise<void>
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user] = useState(null)
  const [loading] = useState(false)

  // Placeholder functions - will rebuild properly
  const signIn = async () => {
    console.log('Sign in placeholder')
  }

  const signUp = async () => {
    console.log('Sign up placeholder')
  }

  const signInWithGoogle = async () => {
    console.log('Google sign in placeholder')
  }

  const signOut = async () => {
    console.log('Sign out placeholder')
  }

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}