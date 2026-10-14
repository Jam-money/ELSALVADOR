import { useForm, type FieldErrors } from "react-hook-form";
import type { Database } from "@/integrations/supabase/types";
import { affidavitValues, toValues } from "@/lib/birth-form";
import type { FormApi, Values } from "@/components/encode-form";
import { Form102 } from "@/components/form102";
import { Form102Page2 } from "@/components/form102-page2";

type Birth = Database["public"]["Tables"]["birth_records"]["Row"];
type Paternity = Database["public"]["Tables"]["paternity_affidavits"]["Row"];
type Delayed = Database["public"]["Tables"]["delayed_registration_affidavits"]["Row"];

export function RecordSheet({ rec, pa, dr }: { rec: Birth; pa: Paternity | null; dr: Delayed | null }) {
  const values: Values = { ...toValues(rec), ...affidavitValues(pa, dr) };
  const { register, watch, setValue } = useForm<Values>({ defaultValues: values });
  const errors: FieldErrors<Values> = {};
  const api: FormApi = { register, watch, setValue, errors, required: () => false, refNo: rec.registry_number ?? "" };

  return (
    <fieldset disabled className="min-w-0 space-y-6 [&_input]:!text-black [&_select]:!appearance-none [&_select]:!text-black [&_textarea]:!text-black">
      <div className="overflow-x-auto"><div className="min-w-[760px]"><Form102 api={api} /></div></div>
      {(pa || dr) ? (
        <div className="overflow-x-auto"><div className="min-w-[760px]"><Form102Page2 api={api} /></div></div>
      ) : (
        <p className="text-sm text-muted-foreground">No page 2 affidavits were filed for this record.</p>
      )}
    </fieldset>
  );
}
