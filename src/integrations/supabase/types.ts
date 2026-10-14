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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          entity: string
          entity_id: string | null
          id: string
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          entity: string
          entity_id?: string | null
          id?: string
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          entity?: string
          entity_id?: string | null
          id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      birth_records: {
        Row: {
          child_first_name: string
          child_last_name: string
          child_middle_name: string | null
          created_at: string
          date_of_birth: string
          date_registered: string
          encoded_by: string | null
          father_name: string | null
          id: string
          mother_name: string
          place_of_birth: string
          registry_number: string | null
          remarks: string | null
          sex: string
          status: Database["public"]["Enums"]["record_status"]
          updated_at: string
          time_of_birth: string | null
          hospital: string | null
          birth_city: string | null
          birth_province: string | null
          type_of_birth: string | null
          birth_order: string | null
          birth_weight_grams: number | null
          mother_first_name: string | null
          mother_middle_name: string | null
          mother_last_name: string | null
          mother_citizenship: string | null
          mother_religion: string | null
          mother_occupation: string | null
          mother_age: number | null
          mother_total_children: number | null
          mother_children_living: number | null
          mother_residence: string | null
          mother_city: string | null
          mother_province: string | null
          father_first_name: string | null
          father_middle_name: string | null
          father_last_name: string | null
          father_citizenship: string | null
          father_religion: string | null
          father_occupation: string | null
          father_age: number | null
          father_residence: string | null
          father_city: string | null
          father_province: string | null
          parents_marriage_date: string | null
          parents_marriage_city: string | null
          parents_marriage_province: string | null
          attendant_type: string | null
          attendant_name: string | null
          informant_name: string | null
          informant_relationship: string | null
          informant_address: string | null
          reg_province: string | null
          reg_city: string | null
          multiple_birth_order: string | null
          mother_children_dead: number | null
          mother_country: string | null
          father_country: string | null
          parents_marriage_country: string | null
          attendant_other: string | null
          attendant_title: string | null
          attendant_address: string | null
          attendant_cert_date: string | null
          informant_date: string | null
          prepared_by_name: string | null
          prepared_by_title: string | null
          prepared_by_date: string | null
          received_by_name: string | null
          received_by_title: string | null
          received_by_date: string | null
          registered_by_name: string | null
          registered_by_title: string | null
          registered_by_date: string | null
          return_reason: string | null
          reviewed_by: string | null
          reviewed_at: string | null
          office_code_8: string | null
          office_code_9: string | null
          office_code_11: string | null
          office_code_13: string | null
          office_code_15: string | null
          office_code_16: string | null
          office_code_17: string | null
          office_code_19: string | null
        }
        Insert: {
          child_first_name: string
          child_last_name: string
          child_middle_name?: string | null
          created_at?: string
          date_of_birth: string
          date_registered?: string
          encoded_by?: string | null
          father_name?: string | null
          id?: string
          mother_name: string
          place_of_birth: string
          registry_number?: string | null
          remarks?: string | null
          sex: string
          status?: Database["public"]["Enums"]["record_status"]
          updated_at?: string
          time_of_birth?: string | null
          hospital?: string | null
          birth_city?: string | null
          birth_province?: string | null
          type_of_birth?: string | null
          birth_order?: string | null
          birth_weight_grams?: number | null
          mother_first_name?: string | null
          mother_middle_name?: string | null
          mother_last_name?: string | null
          mother_citizenship?: string | null
          mother_religion?: string | null
          mother_occupation?: string | null
          mother_age?: number | null
          mother_total_children?: number | null
          mother_children_living?: number | null
          mother_residence?: string | null
          mother_city?: string | null
          mother_province?: string | null
          father_first_name?: string | null
          father_middle_name?: string | null
          father_last_name?: string | null
          father_citizenship?: string | null
          father_religion?: string | null
          father_occupation?: string | null
          father_age?: number | null
          father_residence?: string | null
          father_city?: string | null
          father_province?: string | null
          parents_marriage_date?: string | null
          parents_marriage_city?: string | null
          parents_marriage_province?: string | null
          attendant_type?: string | null
          attendant_name?: string | null
          informant_name?: string | null
          informant_relationship?: string | null
          informant_address?: string | null
          reg_province?: string | null
          reg_city?: string | null
          multiple_birth_order?: string | null
          mother_children_dead?: number | null
          mother_country?: string | null
          father_country?: string | null
          parents_marriage_country?: string | null
          attendant_other?: string | null
          attendant_title?: string | null
          attendant_address?: string | null
          attendant_cert_date?: string | null
          informant_date?: string | null
          prepared_by_name?: string | null
          prepared_by_title?: string | null
          prepared_by_date?: string | null
          received_by_name?: string | null
          received_by_title?: string | null
          received_by_date?: string | null
          registered_by_name?: string | null
          registered_by_title?: string | null
          registered_by_date?: string | null
          return_reason?: string | null
          reviewed_by?: string | null
          reviewed_at?: string | null
          office_code_8?: string | null
          office_code_9?: string | null
          office_code_11?: string | null
          office_code_13?: string | null
          office_code_15?: string | null
          office_code_16?: string | null
          office_code_17?: string | null
          office_code_19?: string | null
        }
        Update: {
          child_first_name?: string
          child_last_name?: string
          child_middle_name?: string | null
          created_at?: string
          date_of_birth?: string
          date_registered?: string
          encoded_by?: string | null
          father_name?: string | null
          id?: string
          mother_name?: string
          place_of_birth?: string
          registry_number?: string | null
          remarks?: string | null
          sex?: string
          status?: Database["public"]["Enums"]["record_status"]
          updated_at?: string
          time_of_birth?: string | null
          hospital?: string | null
          birth_city?: string | null
          birth_province?: string | null
          type_of_birth?: string | null
          birth_order?: string | null
          birth_weight_grams?: number | null
          mother_first_name?: string | null
          mother_middle_name?: string | null
          mother_last_name?: string | null
          mother_citizenship?: string | null
          mother_religion?: string | null
          mother_occupation?: string | null
          mother_age?: number | null
          mother_total_children?: number | null
          mother_children_living?: number | null
          mother_residence?: string | null
          mother_city?: string | null
          mother_province?: string | null
          father_first_name?: string | null
          father_middle_name?: string | null
          father_last_name?: string | null
          father_citizenship?: string | null
          father_religion?: string | null
          father_occupation?: string | null
          father_age?: number | null
          father_residence?: string | null
          father_city?: string | null
          father_province?: string | null
          parents_marriage_date?: string | null
          parents_marriage_city?: string | null
          parents_marriage_province?: string | null
          attendant_type?: string | null
          attendant_name?: string | null
          informant_name?: string | null
          informant_relationship?: string | null
          informant_address?: string | null
          reg_province?: string | null
          reg_city?: string | null
          multiple_birth_order?: string | null
          mother_children_dead?: number | null
          mother_country?: string | null
          father_country?: string | null
          parents_marriage_country?: string | null
          attendant_other?: string | null
          attendant_title?: string | null
          attendant_address?: string | null
          attendant_cert_date?: string | null
          informant_date?: string | null
          prepared_by_name?: string | null
          prepared_by_title?: string | null
          prepared_by_date?: string | null
          received_by_name?: string | null
          received_by_title?: string | null
          received_by_date?: string | null
          registered_by_name?: string | null
          registered_by_title?: string | null
          registered_by_date?: string | null
          return_reason?: string | null
          reviewed_by?: string | null
          reviewed_at?: string | null
          office_code_8?: string | null
          office_code_9?: string | null
          office_code_11?: string | null
          office_code_13?: string | null
          office_code_15?: string | null
          office_code_16?: string | null
          office_code_17?: string | null
          office_code_19?: string | null
        }
        Relationships: []
      }
      paternity_affidavits: {
        Row: {
          birth_record_id: string | null
          child_birth_date: string
          child_birth_place: string
          child_name: string
          created_at: string
          encoded_by: string | null
          father_name: string
          id: string
          id_issued_at: string | null
          id_issued_on: string | null
          id_number: string | null
          mother_name: string
          officer_address: string | null
          officer_name: string | null
          officer_position: string | null
          registry_number: string | null
          sworn_date: string
        }
        Insert: {
          birth_record_id?: string | null
          child_birth_date: string
          child_birth_place: string
          child_name: string
          created_at?: string
          encoded_by?: string | null
          father_name: string
          id?: string
          id_issued_at?: string | null
          id_issued_on?: string | null
          id_number?: string | null
          mother_name: string
          officer_address?: string | null
          officer_name?: string | null
          officer_position?: string | null
          registry_number?: string | null
          sworn_date: string
        }
        Update: {
          birth_record_id?: string | null
          child_birth_date?: string
          child_birth_place?: string
          child_name?: string
          created_at?: string
          encoded_by?: string | null
          father_name?: string
          id?: string
          id_issued_at?: string | null
          id_issued_on?: string | null
          id_number?: string | null
          mother_name?: string
          officer_address?: string | null
          officer_name?: string | null
          officer_position?: string | null
          registry_number?: string | null
          sworn_date?: string
        }
        Relationships: []
      }
      delayed_registration_affidavits: {
        Row: {
          affiant_name: string
          applicant_for: string
          attendant_address: string | null
          attendant_name: string | null
          birth_date: string | null
          birth_place: string | null
          birth_record_id: string | null
          citizenship: string | null
          civil_status: string | null
          created_at: string
          delay_reason: string | null
          encoded_by: string | null
          execution_date: string | null
          execution_place: string | null
          father_acknowledged: boolean | null
          father_name: string | null
          id: string
          id_issued_at: string | null
          id_issued_on: string | null
          id_number: string | null
          married_to: string | null
          officer_address: string | null
          officer_name: string | null
          officer_position: string | null
          parents_marriage_date: string | null
          parents_marriage_place: string | null
          parents_married: boolean | null
          registry_number: string | null
          relationship_to_owner: string | null
          residence_address: string | null
          subject_name: string | null
          sworn_date: string | null
          sworn_place: string | null
        }
        Insert: {
          affiant_name: string
          applicant_for: string
          attendant_address?: string | null
          attendant_name?: string | null
          birth_date?: string | null
          birth_place?: string | null
          birth_record_id?: string | null
          citizenship?: string | null
          civil_status?: string | null
          created_at?: string
          delay_reason?: string | null
          encoded_by?: string | null
          execution_date?: string | null
          execution_place?: string | null
          father_acknowledged?: boolean | null
          father_name?: string | null
          id?: string
          id_issued_at?: string | null
          id_issued_on?: string | null
          id_number?: string | null
          married_to?: string | null
          officer_address?: string | null
          officer_name?: string | null
          officer_position?: string | null
          parents_marriage_date?: string | null
          parents_marriage_place?: string | null
          parents_married?: boolean | null
          registry_number?: string | null
          relationship_to_owner?: string | null
          residence_address?: string | null
          subject_name?: string | null
          sworn_date?: string | null
          sworn_place?: string | null
        }
        Update: {
          affiant_name?: string
          applicant_for?: string
          attendant_address?: string | null
          attendant_name?: string | null
          birth_date?: string | null
          birth_place?: string | null
          birth_record_id?: string | null
          citizenship?: string | null
          civil_status?: string | null
          created_at?: string
          delay_reason?: string | null
          encoded_by?: string | null
          execution_date?: string | null
          execution_place?: string | null
          father_acknowledged?: boolean | null
          father_name?: string | null
          id?: string
          id_issued_at?: string | null
          id_issued_on?: string | null
          id_number?: string | null
          married_to?: string | null
          officer_address?: string | null
          officer_name?: string | null
          officer_position?: string | null
          parents_marriage_date?: string | null
          parents_marriage_place?: string | null
          parents_married?: boolean | null
          registry_number?: string | null
          relationship_to_owner?: string | null
          residence_address?: string | null
          subject_name?: string | null
          sworn_date?: string | null
          sworn_place?: string | null
        }
        Relationships: []
      }
      death_records: {
        Row: {
          cause_of_death: string | null
          created_at: string
          date_of_death: string
          date_registered: string
          deceased_name: string
          encoded_by: string | null
          id: string
          place_of_death: string
          registry_number: string | null
          sex: string
          status: Database["public"]["Enums"]["record_status"]
        }
        Insert: {
          cause_of_death?: string | null
          created_at?: string
          date_of_death: string
          date_registered?: string
          deceased_name: string
          encoded_by?: string | null
          id?: string
          place_of_death: string
          registry_number?: string | null
          sex: string
          status?: Database["public"]["Enums"]["record_status"]
        }
        Update: {
          cause_of_death?: string | null
          created_at?: string
          date_of_death?: string
          date_registered?: string
          deceased_name?: string
          encoded_by?: string | null
          id?: string
          place_of_death?: string
          registry_number?: string | null
          sex?: string
          status?: Database["public"]["Enums"]["record_status"]
        }
        Relationships: []
      }
      marriage_records: {
        Row: {
          created_at: string
          date_of_marriage: string
          date_registered: string
          encoded_by: string | null
          husband_name: string
          id: string
          place_of_marriage: string
          registry_number: string | null
          status: Database["public"]["Enums"]["record_status"]
          wife_name: string
        }
        Insert: {
          created_at?: string
          date_of_marriage: string
          date_registered?: string
          encoded_by?: string | null
          husband_name: string
          id?: string
          place_of_marriage: string
          registry_number?: string | null
          status?: Database["public"]["Enums"]["record_status"]
          wife_name: string
        }
        Update: {
          created_at?: string
          date_of_marriage?: string
          date_registered?: string
          encoded_by?: string | null
          husband_name?: string
          id?: string
          place_of_marriage?: string
          registry_number?: string | null
          status?: Database["public"]["Enums"]["record_status"]
          wife_name?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          full_name: string
          id: string
          position: string | null
          username: string | null
          is_active: boolean
          last_active_at: string | null
        }
        Insert: {
          created_at?: string
          full_name?: string
          id: string
          position?: string | null
          username?: string | null
          is_active?: boolean
          last_active_at?: string | null
        }
        Update: {
          created_at?: string
          full_name?: string
          id?: string
          position?: string | null
          username?: string | null
          is_active?: boolean
          last_active_at?: string | null
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number
          created_at: string
          handled_by: string | null
          id: string
          requester_name: string
          status: string
          transaction_type: string
        }
        Insert: {
          amount?: number
          created_at?: string
          handled_by?: string | null
          id?: string
          requester_name: string
          status?: string
          transaction_type: string
        }
        Update: {
          amount?: number
          created_at?: string
          handled_by?: string | null
          id?: string
          requester_name?: string
          status?: string
          transaction_type?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_encode: { Args: { _user_id: string }; Returns: boolean }
      can_validate: { Args: { _user_id: string }; Returns: boolean }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_staff: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "registrar" | "encoder" | "viewer"
      record_status:
        | "draft"
        | "for_validation"
        | "registered"
        | "amended"
        | "cancelled" | "returned"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      app_role: ["admin", "registrar", "encoder", "viewer"],
      record_status: [
        "draft",
        "for_validation",
        "registered",
        "amended",
        "cancelled",
        "returned"
      ],
    },
  },
} as const
