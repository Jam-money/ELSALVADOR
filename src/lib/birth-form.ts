import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";
import { req, opt, num, dateReq, join, nul, toNum, type Values } from "@/components/encode-form";

export const birthSchema = z.object({
  reg_province: req, reg_city: req,

  child_first_name: req, child_middle_name: opt, child_last_name: req,
  sex: z.enum(["Male", "Female"], { message: "Required" }),
  date_of_birth: dateReq.refine((d) => new Date(d) <= new Date(), "Cannot be in the future"),
  time_of_birth: req, hospital: req, birth_city: req, birth_province: req,
  type_of_birth: req, multiple_birth_order: opt, birth_order: req, birth_weight_grams: num,

  mother_first_name: req, mother_middle_name: opt, mother_last_name: req,
  mother_citizenship: req, mother_religion: req,
  mother_total_children: num, mother_children_living: num, mother_children_dead: num,
  mother_occupation: req, mother_age: num,
  mother_residence: req, mother_city: req, mother_province: req, mother_country: req,

  father_first_name: req, father_middle_name: opt, father_last_name: req,
  father_citizenship: req, father_religion: req, father_occupation: req, father_age: num,
  father_residence: req, father_city: req, father_province: req, father_country: req,

  parents_marriage_date: opt, parents_marriage_city: opt, parents_marriage_province: opt, parents_marriage_country: opt,

  attendant_type: req, attendant_other: opt, attendant_name: req, attendant_title: req, attendant_address: req, attendant_cert_date: dateReq,
  informant_name: req, informant_relationship: req, informant_address: req, informant_date: dateReq,

  prepared_by_name: opt, prepared_by_title: opt, prepared_by_date: opt,
  received_by_name: opt, received_by_title: opt, received_by_date: opt,
  registered_by_name: opt, registered_by_title: opt, registered_by_date: opt,
  remarks: opt,
  office_code_8: opt, office_code_9: opt, office_code_11: opt, office_code_13: opt,
  office_code_15: opt, office_code_16: opt, office_code_17: opt, office_code_19: opt,
});

export type BirthValues = z.infer<typeof birthSchema>;

const numeric = ["birth_weight_grams", "mother_age", "mother_total_children", "mother_children_living", "mother_children_dead", "father_age"];

export function birthRow(v: BirthValues) {
  const row = Object.fromEntries(Object.entries(v).map(([k, val]) => [k, numeric.includes(k) ? toNum(val) : nul(val)]));
  return {
    ...row,
    child_first_name: v.child_first_name, child_last_name: v.child_last_name, sex: v.sex, date_of_birth: v.date_of_birth,
    mother_name: join(v.mother_first_name, v.mother_middle_name, v.mother_last_name),
    father_name: join(v.father_first_name, v.father_middle_name, v.father_last_name),
    place_of_birth: [v.hospital, v.birth_city, v.birth_province].join(", "),
  };
}

export const toValues = (o: object, prefix = ""): Values =>
  Object.fromEntries(Object.entries(o).map(([k, v]) => [prefix + k, v === null || v === undefined ? "" : String(v)]));

type Paternity = Database["public"]["Tables"]["paternity_affidavits"]["Row"];
type Delayed = Database["public"]["Tables"]["delayed_registration_affidavits"]["Row"];

export function affidavitValues(pa: Paternity | null, dr: Delayed | null): Values {
  return {
    ...(pa ? toValues(pa, "pa_") : {}),
    ...(dr
      ? {
          ...toValues(dr, "dr_"),
          dr_applicant_for: dr.applicant_for === "self" ? "My own birth" : "The birth of another person",
          dr_parents_status: dr.parents_married === null ? "" : dr.parents_married ? "Married" : "Not married",
          dr_father_acknowledgment: dr.father_acknowledged === null ? "" : dr.father_acknowledged ? "Acknowledged" : "Not acknowledged",
        }
      : {}),
  };
}
