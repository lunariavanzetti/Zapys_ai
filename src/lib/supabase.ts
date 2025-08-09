import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false, // Let us handle URL detection manually
    flowType: 'pkce'
  }
})

// Database types
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          subscription_tier: 'free' | 'starter' | 'pro' | 'agency'
          locale: 'en' | 'uk' | 'ru' | 'pl' | 'de' | 'es' | 'pt'
          onboarding_completed: boolean
          trial_ends_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          subscription_tier?: 'free' | 'starter' | 'pro' | 'agency'
          locale?: 'en' | 'uk' | 'ru' | 'pl' | 'de' | 'es' | 'pt'
          onboarding_completed?: boolean
          trial_ends_at?: string | null
        }
        Update: {
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          subscription_tier?: 'free' | 'starter' | 'pro' | 'agency'
          locale?: 'en' | 'uk' | 'ru' | 'pl' | 'de' | 'es' | 'pt'
          onboarding_completed?: boolean
          trial_ends_at?: string | null
        }
      }
      workspaces: {
        Row: {
          id: string
          owner_id: string
          name: string
          slug: string
          description: string | null
          branding_config: Record<string, any>
          settings: Record<string, any>
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          owner_id: string
          name: string
          slug: string
          description?: string | null
          branding_config?: Record<string, any>
          settings?: Record<string, any>
          is_active?: boolean
        }
        Update: {
          name?: string
          slug?: string
          description?: string | null
          branding_config?: Record<string, any>
          settings?: Record<string, any>
          is_active?: boolean
        }
      }
      projects: {
        Row: {
          id: string
          workspace_id: string
          created_by: string
          title: string
          description: string | null
          client_name: string | null
          client_email: string | null
          client_company: string | null
          project_data: Record<string, any>
          status: 'draft' | 'active' | 'completed' | 'archived'
          estimated_budget: number | null
          estimated_timeline: number | null
          tags: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          workspace_id: string
          created_by: string
          title: string
          description?: string | null
          client_name?: string | null
          client_email?: string | null
          client_company?: string | null
          project_data?: Record<string, any>
          status?: 'draft' | 'active' | 'completed' | 'archived'
          estimated_budget?: number | null
          estimated_timeline?: number | null
          tags?: string[]
        }
        Update: {
          title?: string
          description?: string | null
          client_name?: string | null
          client_email?: string | null
          client_company?: string | null
          project_data?: Record<string, any>
          status?: 'draft' | 'active' | 'completed' | 'archived'
          estimated_budget?: number | null
          estimated_timeline?: number | null
          tags?: string[]
        }
      }
      proposals: {
        Row: {
          id: string
          project_id: string
          created_by: string
          title: string
          content: Record<string, any>
          content_html: string | null
          content_markdown: string | null
          public_url_slug: string | null
          status: 'draft' | 'sent' | 'viewed' | 'signed' | 'rejected' | 'expired'
          language: 'en' | 'uk' | 'ru' | 'pl' | 'de' | 'es' | 'pt'
          pricing_total: number | null
          pricing_breakdown: Record<string, any>
          timeline_days: number | null
          expires_at: string | null
          sent_at: string | null
          signed_at: string | null
          signature_data: Record<string, any> | null
          analytics_enabled: boolean
          password_protected: boolean
          password_hash: string | null
          custom_branding: Record<string, any>
          metadata: Record<string, any>
          created_at: string
          updated_at: string
        }
        Insert: {
          project_id: string
          created_by: string
          title: string
          content?: Record<string, any>
          content_html?: string | null
          content_markdown?: string | null
          public_url_slug?: string | null
          status?: 'draft' | 'sent' | 'viewed' | 'signed' | 'rejected' | 'expired'
          language?: 'en' | 'uk' | 'ru' | 'pl' | 'de' | 'es' | 'pt'
          pricing_total?: number | null
          pricing_breakdown?: Record<string, any>
          timeline_days?: number | null
          expires_at?: string | null
          analytics_enabled?: boolean
          password_protected?: boolean
          password_hash?: string | null
          custom_branding?: Record<string, any>
          metadata?: Record<string, any>
        }
        Update: {
          title?: string
          content?: Record<string, any>
          content_html?: string | null
          content_markdown?: string | null
          status?: 'draft' | 'sent' | 'viewed' | 'signed' | 'rejected' | 'expired'
          language?: 'en' | 'uk' | 'ru' | 'pl' | 'de' | 'es' | 'pt'
          pricing_total?: number | null
          pricing_breakdown?: Record<string, any>
          timeline_days?: number | null
          expires_at?: string | null
          signature_data?: Record<string, any> | null
          analytics_enabled?: boolean
          password_protected?: boolean
          password_hash?: string | null
          custom_branding?: Record<string, any>
          metadata?: Record<string, any>
        }
      }
    }
    Functions: {
      get_user_with_subscription: {
        Args: { user_uuid: string }
        Returns: {
          id: string
          email: string
          full_name: string
          subscription_tier: string
          locale: string
          trial_ends_at: string
          subscription_status: string
          current_period_end: string
        }[]
      }
      get_user_proposals: {
        Args: {
          user_uuid: string
          workspace_uuid?: string
          status_filter?: string
          limit_count?: number
          offset_count?: number
        }
        Returns: {
          id: string
          title: string
          status: string
          client_name: string
          created_at: string
          updated_at: string
          public_url_slug: string
          total_views: number
          pricing_total: number
        }[]
      }
      get_dashboard_stats: {
        Args: { user_uuid: string }
        Returns: {
          total_proposals: number
          proposals_this_month: number
          total_views: number
          avg_conversion_rate: number
          revenue_this_month: number
          active_proposals: number
        }[]
      }
    }
  }
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']