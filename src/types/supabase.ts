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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      announcements: {
        Row: {
          attachment_url: string | null
          content: string
          created_at: string
          date_posted: string
          id: string
          is_pinned: boolean
          title: string
          valid_regions: Database["public"]["Enums"]["territory"][]
        }
        Insert: {
          attachment_url?: string | null
          content: string
          created_at?: string
          date_posted?: string
          id?: string
          is_pinned?: boolean
          title: string
          valid_regions?: Database["public"]["Enums"]["territory"][]
        }
        Update: {
          attachment_url?: string | null
          content?: string
          created_at?: string
          date_posted?: string
          id?: string
          is_pinned?: boolean
          title?: string
          valid_regions?: Database["public"]["Enums"]["territory"][]
        }
        Relationships: []
      }
      documents: {
        Row: {
          category: Database["public"]["Enums"]["document_category"]
          created_at: string
          file_url: string
          id: string
          product_id: string
          title: string
          valid_regions: Database["public"]["Enums"]["territory"][]
        }
        Insert: {
          category: Database["public"]["Enums"]["document_category"]
          created_at?: string
          file_url: string
          id?: string
          product_id: string
          title: string
          valid_regions?: Database["public"]["Enums"]["territory"][]
        }
        Update: {
          category?: Database["public"]["Enums"]["document_category"]
          created_at?: string
          file_url?: string
          id?: string
          product_id?: string
          title?: string
          valid_regions?: Database["public"]["Enums"]["territory"][]
        }
        Relationships: [
          {
            foreignKeyName: "documents_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      meetings: {
        Row: {
          created_at: string
          date_time: string
          id: string
          meet_link: string | null
          notes: string | null
          partner_id: string
          recording_url: string | null
          title: string
        }
        Insert: {
          created_at?: string
          date_time: string
          id?: string
          meet_link?: string | null
          notes?: string | null
          partner_id: string
          recording_url?: string | null
          title: string
        }
        Update: {
          created_at?: string
          date_time?: string
          id?: string
          meet_link?: string | null
          notes?: string | null
          partner_id?: string
          recording_url?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "meetings_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      product_media: {
        Row: {
          created_at: string
          description: string | null
          id: string
          media_url: string
          product_id: string
          type: Database["public"]["Enums"]["media_type"]
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          media_url: string
          product_id: string
          type?: Database["public"]["Enums"]["media_type"]
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          media_url?: string
          product_id?: string
          type?: Database["public"]["Enums"]["media_type"]
        }
        Relationships: [
          {
            foreignKeyName: "product_media_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          ph_level: number | null
          sku: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          ph_level?: number | null
          sku: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          ph_level?: number | null
          sku?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          company_name: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          is_admin: boolean
          territory_code: Database["public"]["Enums"]["territory"]
          updated_at: string
        }
        Insert: {
          company_name?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          is_admin?: boolean
          territory_code?: Database["public"]["Enums"]["territory"]
          updated_at?: string
        }
        Update: {
          company_name?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          is_admin?: boolean
          territory_code?: Database["public"]["Enums"]["territory"]
          updated_at?: string
        }
        Relationships: []
      }
      support_tickets: {
        Row: {
          category: string
          created_at: string
          description: string
          partner_id: string
          status: Database["public"]["Enums"]["ticket_status"]
          ticket_id: string
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          description: string
          partner_id: string
          status?: Database["public"]["Enums"]["ticket_status"]
          ticket_id?: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string
          partner_id?: string
          status?: Database["public"]["Enums"]["ticket_status"]
          ticket_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_tickets_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      training_modules: {
        Row: {
          category: string
          created_at: string
          duration: number | null
          id: string
          market_segment: string | null
          pdf_resource_url: string | null
          title: string
          valid_regions: Database["public"]["Enums"]["territory"][]
          video_url: string
        }
        Insert: {
          category: string
          created_at?: string
          duration?: number | null
          id?: string
          market_segment?: string | null
          pdf_resource_url?: string | null
          title: string
          valid_regions?: Database["public"]["Enums"]["territory"][]
          video_url: string
        }
        Update: {
          category?: string
          created_at?: string
          duration?: number | null
          id?: string
          market_segment?: string | null
          pdf_resource_url?: string | null
          title?: string
          valid_regions?: Database["public"]["Enums"]["territory"][]
          video_url?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      document_category: "TDS" | "MSDS" | "CERTIFICATE" | "MANUAL"
      media_type: "IMAGE" | "VIDEO"
      territory: "GLOBAL" | "UAE" | "KSA" | "North America" | "Russia" | "India"
      ticket_status: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED"
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
      document_category: ["TDS", "MSDS", "CERTIFICATE", "MANUAL"],
      media_type: ["IMAGE", "VIDEO"],
      territory: ["GLOBAL", "UAE", "KSA", "North America", "Russia", "India"],
      ticket_status: ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"],
    },
  },
} as const
