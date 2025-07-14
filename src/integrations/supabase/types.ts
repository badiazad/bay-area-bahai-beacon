export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      contact_inquiries: {
        Row: {
          city: string
          created_at: string | null
          email: string
          id: string
          interest: string
          message: string | null
          name: string
          phone: string | null
          processed: boolean | null
        }
        Insert: {
          city: string
          created_at?: string | null
          email: string
          id?: string
          interest: string
          message?: string | null
          name: string
          phone?: string | null
          processed?: boolean | null
        }
        Update: {
          city?: string
          created_at?: string | null
          email?: string
          id?: string
          interest?: string
          message?: string | null
          name?: string
          phone?: string | null
          processed?: boolean | null
        }
        Relationships: []
      }
      content: {
        Row: {
          author_id: string
          content: string | null
          created_at: string | null
          excerpt: string | null
          featured_image_url: string | null
          id: string
          published_at: string | null
          slug: string
          status: Database["public"]["Enums"]["content_status"]
          title: string
          type: Database["public"]["Enums"]["content_type"]
          updated_at: string | null
        }
        Insert: {
          author_id: string
          content?: string | null
          created_at?: string | null
          excerpt?: string | null
          featured_image_url?: string | null
          id?: string
          published_at?: string | null
          slug: string
          status?: Database["public"]["Enums"]["content_status"]
          title: string
          type?: Database["public"]["Enums"]["content_type"]
          updated_at?: string | null
        }
        Update: {
          author_id?: string
          content?: string | null
          created_at?: string | null
          excerpt?: string | null
          featured_image_url?: string | null
          id?: string
          published_at?: string | null
          slug?: string
          status?: Database["public"]["Enums"]["content_status"]
          title?: string
          type?: Database["public"]["Enums"]["content_type"]
          updated_at?: string | null
        }
        Relationships: []
      }
      event_reminders: {
        Row: {
          error_message: string | null
          event_id: string
          id: string
          recipient_email: string
          reminder_type: string
          sent_at: string
          success: boolean
        }
        Insert: {
          error_message?: string | null
          event_id: string
          id?: string
          recipient_email: string
          reminder_type: string
          sent_at?: string
          success?: boolean
        }
        Update: {
          error_message?: string | null
          event_id?: string
          id?: string
          recipient_email?: string
          reminder_type?: string
          sent_at?: string
          success?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "event_reminders_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      event_rsvps: {
        Row: {
          created_at: string
          dietary_restrictions: string | null
          email: string
          event_id: string
          guest_count: number
          id: string
          name: string
          notes: string | null
          phone: string | null
          reminder_email: boolean | null
          reminder_sms: boolean | null
        }
        Insert: {
          created_at?: string
          dietary_restrictions?: string | null
          email: string
          event_id: string
          guest_count?: number
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          reminder_email?: boolean | null
          reminder_sms?: boolean | null
        }
        Update: {
          created_at?: string
          dietary_restrictions?: string | null
          email?: string
          event_id?: string
          guest_count?: number
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          reminder_email?: boolean | null
          reminder_sms?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "event_rsvps_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          calendar_type: Database["public"]["Enums"]["event_calendar"]
          created_at: string
          created_by: string
          description: string | null
          end_date: string | null
          featured_image_url: string | null
          host_email: string
          host_name: string
          id: string
          is_recurring: boolean
          location: string
          parent_event_id: string | null
          recurrence_end_date: string | null
          recurrence_interval: number | null
          recurrence_type: Database["public"]["Enums"]["event_recurrence"]
          slug: string
          start_date: string
          status: Database["public"]["Enums"]["event_status"]
          title: string
          updated_at: string
        }
        Insert: {
          calendar_type?: Database["public"]["Enums"]["event_calendar"]
          created_at?: string
          created_by: string
          description?: string | null
          end_date?: string | null
          featured_image_url?: string | null
          host_email: string
          host_name: string
          id?: string
          is_recurring?: boolean
          location: string
          parent_event_id?: string | null
          recurrence_end_date?: string | null
          recurrence_interval?: number | null
          recurrence_type?: Database["public"]["Enums"]["event_recurrence"]
          slug: string
          start_date: string
          status?: Database["public"]["Enums"]["event_status"]
          title: string
          updated_at?: string
        }
        Update: {
          calendar_type?: Database["public"]["Enums"]["event_calendar"]
          created_at?: string
          created_by?: string
          description?: string | null
          end_date?: string | null
          featured_image_url?: string | null
          host_email?: string
          host_name?: string
          id?: string
          is_recurring?: boolean
          location?: string
          parent_event_id?: string | null
          recurrence_end_date?: string | null
          recurrence_interval?: number | null
          recurrence_type?: Database["public"]["Enums"]["event_recurrence"]
          slug?: string
          start_date?: string
          status?: Database["public"]["Enums"]["event_status"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "events_parent_event_id_fkey"
            columns: ["parent_event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      instagram_media: {
        Row: {
          cached_at: string | null
          caption: string | null
          id: string
          instagram_id: string
          media_type: string
          media_url: string
          permalink: string | null
          thumbnail_url: string | null
          timestamp: string
        }
        Insert: {
          cached_at?: string | null
          caption?: string | null
          id?: string
          instagram_id: string
          media_type: string
          media_url: string
          permalink?: string | null
          thumbnail_url?: string | null
          timestamp: string
        }
        Update: {
          cached_at?: string | null
          caption?: string | null
          id?: string
          instagram_id?: string
          media_type?: string
          media_url?: string
          permalink?: string | null
          thumbnail_url?: string | null
          timestamp?: string
        }
        Relationships: []
      }
      media: {
        Row: {
          alt_text: string | null
          caption: string | null
          created_at: string | null
          filename: string
          id: string
          mime_type: string
          original_filename: string
          size_bytes: number
          thumbnail_url: string | null
          uploaded_by: string
          url: string
        }
        Insert: {
          alt_text?: string | null
          caption?: string | null
          created_at?: string | null
          filename: string
          id?: string
          mime_type: string
          original_filename: string
          size_bytes: number
          thumbnail_url?: string | null
          uploaded_by: string
          url: string
        }
        Update: {
          alt_text?: string | null
          caption?: string | null
          created_at?: string | null
          filename?: string
          id?: string
          mime_type?: string
          original_filename?: string
          size_bytes?: number
          thumbnail_url?: string | null
          uploaded_by?: string
          url?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string
          full_name: string
          id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          email: string
          full_name: string
          id?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          email?: string
          full_name?: string
          id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_event_slug: {
        Args: { title: string }
        Returns: string
      }
      get_user_roles: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["user_role"][]
      }
      has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["user_role"]
        }
        Returns: boolean
      }
    }
    Enums: {
      content_status: "draft" | "pending" | "published" | "archived"
      content_type: "page" | "post" | "event" | "gallery"
      event_calendar:
        | "devotional"
        | "youth_class"
        | "childrens_class"
        | "study_circle"
        | "holy_day"
        | "community_gathering"
        | "other"
      event_recurrence: "none" | "daily" | "weekly" | "monthly" | "yearly"
      event_status: "draft" | "published" | "cancelled"
      user_role: "admin" | "editor" | "author"
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
      content_status: ["draft", "pending", "published", "archived"],
      content_type: ["page", "post", "event", "gallery"],
      event_calendar: [
        "devotional",
        "youth_class",
        "childrens_class",
        "study_circle",
        "holy_day",
        "community_gathering",
        "other",
      ],
      event_recurrence: ["none", "daily", "weekly", "monthly", "yearly"],
      event_status: ["draft", "published", "cancelled"],
      user_role: ["admin", "editor", "author"],
    },
  },
} as const
