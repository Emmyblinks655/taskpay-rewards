export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      ads: {
        Row: {
          ad_content: string
          ad_name: string
          ad_type: Database["public"]["Enums"]["ad_type"]
          created_at: string
          id: string
          placement: Database["public"]["Enums"]["ad_placement"][]
          status: boolean
          updated_at: string
        }
        Insert: {
          ad_content: string
          ad_name: string
          ad_type: Database["public"]["Enums"]["ad_type"]
          created_at?: string
          id?: string
          placement?: Database["public"]["Enums"]["ad_placement"][]
          status?: boolean
          updated_at?: string
        }
        Update: {
          ad_content?: string
          ad_name?: string
          ad_type?: Database["public"]["Enums"]["ad_type"]
          created_at?: string
          id?: string
          placement?: Database["public"]["Enums"]["ad_placement"][]
          status?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      free_accounts: {
        Row: {
          claimed_at: string | null
          claimed_by: string | null
          created_at: string
          id: string
          password: string
          platform_name: string
          status: boolean
          updated_at: string
          username: string
        }
        Insert: {
          claimed_at?: string | null
          claimed_by?: string | null
          created_at?: string
          id?: string
          password: string
          platform_name: string
          status?: boolean
          updated_at?: string
          username: string
        }
        Update: {
          claimed_at?: string | null
          claimed_by?: string | null
          created_at?: string
          id?: string
          password?: string
          platform_name?: string
          status?: boolean
          updated_at?: string
          username?: string
        }
        Relationships: []
      }
      orders: {
        Row: {
          amount: number
          commission: number
          cost: number
          created_at: string
          error_message: string | null
          id: string
          provider_id: string | null
          provider_ref: string | null
          retry_count: number
          service_id: string
          status: Database["public"]["Enums"]["order_status"]
          target: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          commission?: number
          cost: number
          created_at?: string
          error_message?: string | null
          id?: string
          provider_id?: string | null
          provider_ref?: string | null
          retry_count?: number
          service_id: string
          status?: Database["public"]["Enums"]["order_status"]
          target: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          commission?: number
          cost?: number
          created_at?: string
          error_message?: string | null
          id?: string
          provider_id?: string | null
          provider_ref?: string | null
          retry_count?: number
          service_id?: string
          status?: Database["public"]["Enums"]["order_status"]
          target?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "providers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      otp_codes: {
        Row: {
          code: string
          created_at: string
          email: string
          expires_at: string
          id: string
          verified: boolean
        }
        Insert: {
          code: string
          created_at?: string
          email: string
          expires_at: string
          id?: string
          verified?: boolean
        }
        Update: {
          code?: string
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          verified?: boolean
        }
        Relationships: []
      }
      payout_requests: {
        Row: {
          amount: number
          created_at: string
          details: Json
          id: string
          method: Database["public"]["Enums"]["payout_method"]
          status: Database["public"]["Enums"]["payout_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          details: Json
          id?: string
          method: Database["public"]["Enums"]["payout_method"]
          status?: Database["public"]["Enums"]["payout_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          details?: Json
          id?: string
          method?: Database["public"]["Enums"]["payout_method"]
          status?: Database["public"]["Enums"]["payout_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          agent_rate_multiplier: number | null
          balance: number
          created_at: string
          email: string
          id: string
          is_agent: boolean
          kyc_documents: Json | null
          kyc_reviewed_at: string | null
          kyc_reviewed_by: string | null
          kyc_status: Database["public"]["Enums"]["kyc_status"]
          referral_code: string | null
          referred_by: string | null
          updated_at: string
        }
        Insert: {
          agent_rate_multiplier?: number | null
          balance?: number
          created_at?: string
          email: string
          id: string
          is_agent?: boolean
          kyc_documents?: Json | null
          kyc_reviewed_at?: string | null
          kyc_reviewed_by?: string | null
          kyc_status?: Database["public"]["Enums"]["kyc_status"]
          referral_code?: string | null
          referred_by?: string | null
          updated_at?: string
        }
        Update: {
          agent_rate_multiplier?: number | null
          balance?: number
          created_at?: string
          email?: string
          id?: string
          is_agent?: boolean
          kyc_documents?: Json | null
          kyc_reviewed_at?: string | null
          kyc_reviewed_by?: string | null
          kyc_status?: Database["public"]["Enums"]["kyc_status"]
          referral_code?: string | null
          referred_by?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_kyc_reviewed_by_fkey"
            columns: ["kyc_reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_referred_by_fkey"
            columns: ["referred_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      provider_logs: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          order_id: string | null
          provider_id: string | null
          request_data: Json | null
          response_data: Json | null
          status_code: number | null
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          order_id?: string | null
          provider_id?: string | null
          request_data?: Json | null
          response_data?: Json | null
          status_code?: number | null
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          order_id?: string | null
          provider_id?: string | null
          request_data?: Json | null
          response_data?: Json | null
          status_code?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "provider_logs_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "providers"
            referencedColumns: ["id"]
          },
        ]
      }
      providers: {
        Row: {
          api_key_encrypted: string
          config_json: Json | null
          created_at: string
          enabled: boolean
          id: string
          name: string
          priority: number
          updated_at: string
        }
        Insert: {
          api_key_encrypted: string
          config_json?: Json | null
          created_at?: string
          enabled?: boolean
          id?: string
          name: string
          priority?: number
          updated_at?: string
        }
        Update: {
          api_key_encrypted?: string
          config_json?: Json | null
          created_at?: string
          enabled?: boolean
          id?: string
          name?: string
          priority?: number
          updated_at?: string
        }
        Relationships: []
      }
      referrals: {
        Row: {
          commission_amount: number
          commission_percent: number
          created_at: string
          id: string
          order_id: string | null
          referred_id: string
          referrer_id: string
        }
        Insert: {
          commission_amount: number
          commission_percent: number
          created_at?: string
          id?: string
          order_id?: string | null
          referred_id: string
          referrer_id: string
        }
        Update: {
          commission_amount?: number
          commission_percent?: number
          created_at?: string
          id?: string
          order_id?: string | null
          referred_id?: string
          referrer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "referrals_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referrals_referred_id_fkey"
            columns: ["referred_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referrals_referrer_id_fkey"
            columns: ["referrer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          category: Database["public"]["Enums"]["service_category"]
          country_code: string
          created_at: string
          currency: string
          id: string
          name: string
          operator_name: string
          price: number
          provider_service_id: string
          sale_price: number | null
          status: boolean
          updated_at: string
        }
        Insert: {
          category: Database["public"]["Enums"]["service_category"]
          country_code: string
          created_at?: string
          currency?: string
          id?: string
          name: string
          operator_name: string
          price: number
          provider_service_id: string
          sale_price?: number | null
          status?: boolean
          updated_at?: string
        }
        Update: {
          category?: Database["public"]["Enums"]["service_category"]
          country_code?: string
          created_at?: string
          currency?: string
          id?: string
          name?: string
          operator_name?: string
          price?: number
          provider_service_id?: string
          sale_price?: number | null
          status?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      settings: {
        Row: {
          id: string
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          id?: string
          key: string
          updated_at?: string
          value: Json
        }
        Update: {
          id?: string
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      task_submissions: {
        Row: {
          created_at: string
          id: string
          proof_image: string | null
          status: Database["public"]["Enums"]["submission_status"]
          task_id: string
          updated_at: string
          user_id: string
          username_proof: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          proof_image?: string | null
          status?: Database["public"]["Enums"]["submission_status"]
          task_id: string
          updated_at?: string
          user_id: string
          username_proof?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          proof_image?: string | null
          status?: Database["public"]["Enums"]["submission_status"]
          task_id?: string
          updated_at?: string
          user_id?: string
          username_proof?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "task_submissions_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          created_at: string
          description: string
          id: string
          link: string
          reward: number
          status: boolean
          title: string
          type: Database["public"]["Enums"]["task_type"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          link: string
          reward: number
          status?: boolean
          title: string
          type: Database["public"]["Enums"]["task_type"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          link?: string
          reward?: number
          status?: boolean
          title?: string
          type?: Database["public"]["Enums"]["task_type"]
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      wallet_transactions: {
        Row: {
          amount: number
          balance_after: number
          balance_before: number
          created_at: string
          description: string | null
          id: string
          metadata: Json | null
          reference: string | null
          type: Database["public"]["Enums"]["transaction_type"]
          user_id: string
        }
        Insert: {
          amount: number
          balance_after: number
          balance_before: number
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          reference?: string | null
          type: Database["public"]["Enums"]["transaction_type"]
          user_id: string
        }
        Update: {
          amount?: number
          balance_after?: number
          balance_before?: number
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          reference?: string | null
          type?: Database["public"]["Enums"]["transaction_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wallet_transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      approve_task_submission: {
        Args: { submission_id: string }
        Returns: undefined
      }
      generate_referral_code: { Args: never; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      process_order: {
        Args: {
          p_error_message?: string
          p_new_status: Database["public"]["Enums"]["order_status"]
          p_order_id: string
          p_provider_ref?: string
        }
        Returns: undefined
      }
    }
    Enums: {
      ad_placement: "homepage" | "dashboard" | "tasks" | "free_accounts"
      ad_type: "code" | "image"
      app_role: "admin" | "user"
      kyc_status: "not_submitted" | "pending" | "approved" | "rejected"
      order_status:
        | "pending"
        | "processing"
        | "completed"
        | "failed"
        | "refunded"
      payout_method: "bank" | "crypto" | "mobile_money"
      payout_status: "pending" | "paid" | "rejected"
      service_category:
        | "airtime"
        | "data"
        | "cable_tv"
        | "electricity"
        | "internet"
      submission_status: "pending" | "approved" | "rejected"
      task_type:
        | "twitter_follow"
        | "instagram_follow"
        | "youtube_subscribe"
        | "telegram_join"
        | "platform_signup"
        | "visit_url"
      transaction_type:
        | "credit"
        | "debit"
        | "commission"
        | "withdrawal"
        | "topup"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      ad_placement: ["homepage", "dashboard", "tasks", "free_accounts"],
      ad_type: ["code", "image"],
      app_role: ["admin", "user"],
      kyc_status: ["not_submitted", "pending", "approved", "rejected"],
      order_status: [
        "pending",
        "processing",
        "completed",
        "failed",
        "refunded",
      ],
      payout_method: ["bank", "crypto", "mobile_money"],
      payout_status: ["pending", "paid", "rejected"],
      service_category: [
        "airtime",
        "data",
        "cable_tv",
        "electricity",
        "internet",
      ],
      submission_status: ["pending", "approved", "rejected"],
      task_type: [
        "twitter_follow",
        "instagram_follow",
        "youtube_subscribe",
        "telegram_join",
        "platform_signup",
        "visit_url",
      ],
      transaction_type: [
        "credit",
        "debit",
        "commission",
        "withdrawal",
        "topup",
      ],
    },
  },
} as const
