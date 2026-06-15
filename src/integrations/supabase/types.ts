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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      campaign_suppliers: {
        Row: {
          campaign_id: string
          commission_status: string | null
          company_name: string
          contact_name: string | null
          created_at: string
          email: string | null
          escalated: boolean
          id: string
          is_partner: boolean | null
          match_reasons: string | null
          match_score: number | null
          response: string | null
          source: string
          stage: string
          supplier_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          campaign_id: string
          commission_status?: string | null
          company_name: string
          contact_name?: string | null
          created_at?: string
          email?: string | null
          escalated?: boolean
          id?: string
          is_partner?: boolean | null
          match_reasons?: string | null
          match_score?: number | null
          response?: string | null
          source?: string
          stage?: string
          supplier_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          campaign_id?: string
          commission_status?: string | null
          company_name?: string
          contact_name?: string | null
          created_at?: string
          email?: string | null
          escalated?: boolean
          id?: string
          is_partner?: boolean | null
          match_reasons?: string | null
          match_score?: number | null
          response?: string | null
          source?: string
          stage?: string
          supplier_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaign_suppliers_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_suppliers_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      campaigns: {
        Row: {
          brand: string
          budget_notes: string | null
          category: string | null
          certifications_needed: string | null
          competitor_reference: string | null
          contact: string | null
          created_at: string
          id: string
          order_id: string | null
          packaging: string | null
          plan: string
          product: string | null
          status: string
          target_launch: string | null
          technical_requirements: string | null
          updated_at: string
          upgraded: boolean
          user_id: string
          volume: string | null
        }
        Insert: {
          brand: string
          budget_notes?: string | null
          category?: string | null
          certifications_needed?: string | null
          competitor_reference?: string | null
          contact?: string | null
          created_at?: string
          id?: string
          order_id?: string | null
          packaging?: string | null
          plan?: string
          product?: string | null
          status?: string
          target_launch?: string | null
          technical_requirements?: string | null
          updated_at?: string
          upgraded?: boolean
          user_id: string
          volume?: string | null
        }
        Update: {
          brand?: string
          budget_notes?: string | null
          category?: string | null
          certifications_needed?: string | null
          competitor_reference?: string | null
          contact?: string | null
          created_at?: string
          id?: string
          order_id?: string | null
          packaging?: string | null
          plan?: string
          product?: string | null
          status?: string
          target_launch?: string | null
          technical_requirements?: string | null
          updated_at?: string
          upgraded?: boolean
          user_id?: string
          volume?: string | null
        }
        Relationships: []
      }
      escalations: {
        Row: {
          campaign_id: string | null
          campaign_supplier_id: string | null
          context: string | null
          created_at: string
          id: string
          reason: string
          resolution: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          campaign_id?: string | null
          campaign_supplier_id?: string | null
          context?: string | null
          created_at?: string
          id?: string
          reason: string
          resolution?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          campaign_id?: string | null
          campaign_supplier_id?: string | null
          context?: string | null
          created_at?: string
          id?: string
          reason?: string
          resolution?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "escalations_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "escalations_campaign_supplier_id_fkey"
            columns: ["campaign_supplier_id"]
            isOneToOne: false
            referencedRelation: "campaign_suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      form_submissions: {
        Row: {
          certifications: string | null
          company_name: string
          contact_name: string | null
          created_at: string
          email: string | null
          equipment: string | null
          fill_type: string | null
          id: string
          monthly_capacity: string | null
          moq: string | null
          notes: string | null
          open_to_commission: string | null
          products_made: string | null
          region: string | null
          submission_date: string | null
          supplier_type: string | null
        }
        Insert: {
          certifications?: string | null
          company_name: string
          contact_name?: string | null
          created_at?: string
          email?: string | null
          equipment?: string | null
          fill_type?: string | null
          id?: string
          monthly_capacity?: string | null
          moq?: string | null
          notes?: string | null
          open_to_commission?: string | null
          products_made?: string | null
          region?: string | null
          submission_date?: string | null
          supplier_type?: string | null
        }
        Update: {
          certifications?: string | null
          company_name?: string
          contact_name?: string | null
          created_at?: string
          email?: string | null
          equipment?: string | null
          fill_type?: string | null
          id?: string
          monthly_capacity?: string | null
          moq?: string | null
          notes?: string | null
          open_to_commission?: string | null
          products_made?: string | null
          region?: string | null
          submission_date?: string | null
          supplier_type?: string | null
        }
        Relationships: []
      }
      messages: {
        Row: {
          body: string
          campaign_supplier_id: string
          classification: string | null
          created_at: string
          direction: string
          id: string
          subject: string | null
          user_id: string
        }
        Insert: {
          body: string
          campaign_supplier_id: string
          classification?: string | null
          created_at?: string
          direction?: string
          id?: string
          subject?: string | null
          user_id: string
        }
        Update: {
          body?: string
          campaign_supplier_id?: string
          classification?: string | null
          created_at?: string
          direction?: string
          id?: string
          subject?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_campaign_supplier_id_fkey"
            columns: ["campaign_supplier_id"]
            isOneToOne: false
            referencedRelation: "campaign_suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      partners: {
        Row: {
          agreement_date: string | null
          capabilities: string | null
          certifications: string | null
          company_name: string
          contact_name: string | null
          created_at: string
          email: string | null
          fill_type: string | null
          id: string
          key_equipment: string | null
          monthly_capacity: string | null
          moq: string | null
          nda_signed: string | null
          product_categories: string | null
          ref_id: string | null
          referral_commission: string | null
          region: string | null
          relationship_notes: string | null
          supplier_type: string | null
          updated_at: string
        }
        Insert: {
          agreement_date?: string | null
          capabilities?: string | null
          certifications?: string | null
          company_name: string
          contact_name?: string | null
          created_at?: string
          email?: string | null
          fill_type?: string | null
          id?: string
          key_equipment?: string | null
          monthly_capacity?: string | null
          moq?: string | null
          nda_signed?: string | null
          product_categories?: string | null
          ref_id?: string | null
          referral_commission?: string | null
          region?: string | null
          relationship_notes?: string | null
          supplier_type?: string | null
          updated_at?: string
        }
        Update: {
          agreement_date?: string | null
          capabilities?: string | null
          certifications?: string | null
          company_name?: string
          contact_name?: string | null
          created_at?: string
          email?: string | null
          fill_type?: string | null
          id?: string
          key_equipment?: string | null
          monthly_capacity?: string | null
          moq?: string | null
          nda_signed?: string | null
          product_categories?: string | null
          ref_id?: string | null
          referral_commission?: string | null
          region?: string | null
          relationship_notes?: string | null
          supplier_type?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      suppliers: {
        Row: {
          can_do: string | null
          cannot_do: string | null
          capabilities_claimed: string | null
          certifications: string | null
          company_name: string
          contact_name: string | null
          created_at: string
          email: string | null
          fill_type: string | null
          form_filled: boolean | null
          id: string
          in_database: boolean | null
          key_equipment: string | null
          last_contacted: string | null
          last_response: string | null
          moq: string | null
          product_categories: string | null
          ref_id: string | null
          region: string | null
          supplier_type: string | null
          updated_at: string
        }
        Insert: {
          can_do?: string | null
          cannot_do?: string | null
          capabilities_claimed?: string | null
          certifications?: string | null
          company_name: string
          contact_name?: string | null
          created_at?: string
          email?: string | null
          fill_type?: string | null
          form_filled?: boolean | null
          id?: string
          in_database?: boolean | null
          key_equipment?: string | null
          last_contacted?: string | null
          last_response?: string | null
          moq?: string | null
          product_categories?: string | null
          ref_id?: string | null
          region?: string | null
          supplier_type?: string | null
          updated_at?: string
        }
        Update: {
          can_do?: string | null
          cannot_do?: string | null
          capabilities_claimed?: string | null
          certifications?: string | null
          company_name?: string
          contact_name?: string | null
          created_at?: string
          email?: string | null
          fill_type?: string | null
          form_filled?: boolean | null
          id?: string
          in_database?: boolean | null
          key_equipment?: string | null
          last_contacted?: string | null
          last_response?: string | null
          moq?: string | null
          product_categories?: string | null
          ref_id?: string | null
          region?: string | null
          supplier_type?: string | null
          updated_at?: string
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
      [_ in never]: never
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
    Enums: {},
  },
} as const
