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
      checkouts: {
        Row: {
          active: boolean | null
          countdown_minutes: number | null
          created_at: string | null
          custom_fields: Json | null
          has_countdown: boolean | null
          id: string
          logo_url: string | null
          name: string
          product_id: string
          slug: string
          testimonials: Json | null
          theme_color: string | null
          user_id: string
        }
        Insert: {
          active?: boolean | null
          countdown_minutes?: number | null
          created_at?: string | null
          custom_fields?: Json | null
          has_countdown?: boolean | null
          id?: string
          logo_url?: string | null
          name: string
          product_id: string
          slug: string
          testimonials?: Json | null
          theme_color?: string | null
          user_id: string
        }
        Update: {
          active?: boolean | null
          countdown_minutes?: number | null
          created_at?: string | null
          custom_fields?: Json | null
          has_countdown?: boolean | null
          id?: string
          logo_url?: string | null
          name?: string
          product_id?: string
          slug?: string
          testimonials?: Json | null
          theme_color?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "checkouts_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checkouts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      delivery_logs: {
        Row: {
          customer_email: string
          delivered_at: string | null
          delivery_content: string
          delivery_type: Database["public"]["Enums"]["delivery_type"]
          id: string
          payment_id: string | null
          product_name: string
          upsell_payment_id: string | null
        }
        Insert: {
          customer_email: string
          delivered_at?: string | null
          delivery_content: string
          delivery_type: Database["public"]["Enums"]["delivery_type"]
          id?: string
          payment_id?: string | null
          product_name: string
          upsell_payment_id?: string | null
        }
        Update: {
          customer_email?: string
          delivered_at?: string | null
          delivery_content?: string
          delivery_type?: Database["public"]["Enums"]["delivery_type"]
          id?: string
          payment_id?: string | null
          product_name?: string
          upsell_payment_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "delivery_logs_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "delivery_logs_upsell_payment_id_fkey"
            columns: ["upsell_payment_id"]
            isOneToOne: false
            referencedRelation: "upsell_payments"
            referencedColumns: ["id"]
          },
        ]
      }
      downsells: {
        Row: {
          active: boolean | null
          checkout_id: string
          created_at: string | null
          delivery_content: string | null
          delivery_type: Database["public"]["Enums"]["delivery_type"]
          description: string | null
          id: string
          name: string
          price: number
        }
        Insert: {
          active?: boolean | null
          checkout_id: string
          created_at?: string | null
          delivery_content?: string | null
          delivery_type?: Database["public"]["Enums"]["delivery_type"]
          description?: string | null
          id?: string
          name: string
          price: number
        }
        Update: {
          active?: boolean | null
          checkout_id?: string
          created_at?: string | null
          delivery_content?: string | null
          delivery_type?: Database["public"]["Enums"]["delivery_type"]
          description?: string | null
          id?: string
          name?: string
          price?: number
        }
        Relationships: [
          {
            foreignKeyName: "downsells_checkout_id_fkey"
            columns: ["checkout_id"]
            isOneToOne: false
            referencedRelation: "checkouts"
            referencedColumns: ["id"]
          },
        ]
      }
      order_bumps: {
        Row: {
          active: boolean | null
          checkout_id: string
          created_at: string | null
          delivery_content: string | null
          delivery_type: Database["public"]["Enums"]["delivery_type"]
          description: string | null
          id: string
          name: string
          price: number
        }
        Insert: {
          active?: boolean | null
          checkout_id: string
          created_at?: string | null
          delivery_content?: string | null
          delivery_type?: Database["public"]["Enums"]["delivery_type"]
          description?: string | null
          id?: string
          name: string
          price: number
        }
        Update: {
          active?: boolean | null
          checkout_id?: string
          created_at?: string | null
          delivery_content?: string | null
          delivery_type?: Database["public"]["Enums"]["delivery_type"]
          description?: string | null
          id?: string
          name?: string
          price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_bumps_checkout_id_fkey"
            columns: ["checkout_id"]
            isOneToOne: false
            referencedRelation: "checkouts"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          bump_amount: number | null
          checkout_id: string
          created_at: string | null
          customer_data: Json | null
          customer_email: string
          customer_name: string
          expires_at: string | null
          id: string
          paid_at: string | null
          pix_copy_paste: string | null
          pix_qr_code: string | null
          status: Database["public"]["Enums"]["payment_status"] | null
          total_amount: number
          txid: string | null
        }
        Insert: {
          amount: number
          bump_amount?: number | null
          checkout_id: string
          created_at?: string | null
          customer_data?: Json | null
          customer_email: string
          customer_name: string
          expires_at?: string | null
          id?: string
          paid_at?: string | null
          pix_copy_paste?: string | null
          pix_qr_code?: string | null
          status?: Database["public"]["Enums"]["payment_status"] | null
          total_amount: number
          txid?: string | null
        }
        Update: {
          amount?: number
          bump_amount?: number | null
          checkout_id?: string
          created_at?: string | null
          customer_data?: Json | null
          customer_email?: string
          customer_name?: string
          expires_at?: string | null
          id?: string
          paid_at?: string | null
          pix_copy_paste?: string | null
          pix_qr_code?: string | null
          status?: Database["public"]["Enums"]["payment_status"] | null
          total_amount?: number
          txid?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_checkout_id_fkey"
            columns: ["checkout_id"]
            isOneToOne: false
            referencedRelation: "checkouts"
            referencedColumns: ["id"]
          },
        ]
      }
      presells: {
        Row: {
          active: boolean | null
          bullet_points: Json | null
          checkout_id: string
          created_at: string | null
          description: string | null
          headline: string
          id: string
          name: string
          video_url: string | null
        }
        Insert: {
          active?: boolean | null
          bullet_points?: Json | null
          checkout_id: string
          created_at?: string | null
          description?: string | null
          headline: string
          id?: string
          name: string
          video_url?: string | null
        }
        Update: {
          active?: boolean | null
          bullet_points?: Json | null
          checkout_id?: string
          created_at?: string | null
          description?: string | null
          headline?: string
          id?: string
          name?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "presells_checkout_id_fkey"
            columns: ["checkout_id"]
            isOneToOne: false
            referencedRelation: "checkouts"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          active: boolean | null
          created_at: string | null
          delivery_content: string | null
          delivery_type: Database["public"]["Enums"]["delivery_type"]
          description: string | null
          id: string
          name: string
          price: number
          user_id: string
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          delivery_content?: string | null
          delivery_type?: Database["public"]["Enums"]["delivery_type"]
          description?: string | null
          id?: string
          name: string
          price: number
          user_id: string
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          delivery_content?: string | null
          delivery_type?: Database["public"]["Enums"]["delivery_type"]
          description?: string | null
          id?: string
          name?: string
          price?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string
          id: string
          name: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id: string
          name?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          name?: string | null
        }
        Relationships: []
      }
      upsell_payments: {
        Row: {
          amount: number
          created_at: string | null
          expires_at: string | null
          id: string
          paid_at: string | null
          payment_id: string
          pix_copy_paste: string | null
          pix_qr_code: string | null
          status: Database["public"]["Enums"]["payment_status"] | null
          txid: string | null
          upsell_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          expires_at?: string | null
          id?: string
          paid_at?: string | null
          payment_id: string
          pix_copy_paste?: string | null
          pix_qr_code?: string | null
          status?: Database["public"]["Enums"]["payment_status"] | null
          txid?: string | null
          upsell_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          expires_at?: string | null
          id?: string
          paid_at?: string | null
          payment_id?: string
          pix_copy_paste?: string | null
          pix_qr_code?: string | null
          status?: Database["public"]["Enums"]["payment_status"] | null
          txid?: string | null
          upsell_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "upsell_payments_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "upsell_payments_upsell_id_fkey"
            columns: ["upsell_id"]
            isOneToOne: false
            referencedRelation: "upsells"
            referencedColumns: ["id"]
          },
        ]
      }
      upsells: {
        Row: {
          active: boolean | null
          checkout_id: string
          created_at: string | null
          delivery_content: string | null
          delivery_type: Database["public"]["Enums"]["delivery_type"]
          description: string | null
          id: string
          name: string
          price: number
        }
        Insert: {
          active?: boolean | null
          checkout_id: string
          created_at?: string | null
          delivery_content?: string | null
          delivery_type?: Database["public"]["Enums"]["delivery_type"]
          description?: string | null
          id?: string
          name: string
          price: number
        }
        Update: {
          active?: boolean | null
          checkout_id?: string
          created_at?: string | null
          delivery_content?: string | null
          delivery_type?: Database["public"]["Enums"]["delivery_type"]
          description?: string | null
          id?: string
          name?: string
          price?: number
        }
        Relationships: [
          {
            foreignKeyName: "upsells_checkout_id_fkey"
            columns: ["checkout_id"]
            isOneToOne: false
            referencedRelation: "checkouts"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      delivery_type: "file" | "link" | "text"
      payment_status: "pending" | "paid" | "expired" | "cancelled"
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
      delivery_type: ["file", "link", "text"],
      payment_status: ["pending", "paid", "expired", "cancelled"],
    },
  },
} as const
