import type { ReactNode } from "react";
import type { FormApi } from "@/components/encode-form";
import { Line, SigLine } from "@/components/form102";

const B = "border-[#1f6f3f]";
const cls = "mx-1 inline-block h-6 border-0 border-b border-[#1f6f3f] bg-transparent px-1 align-baseline text-sm outline-none focus:bg-gold/10";

function Blank({ api, name, type = "text", w = "w-44" }: { api: FormApi; name: string; type?: string; w?: string }) {
  const bad = !!api.errors[name];
  return <input type={type} {...api.register(name)} title={bad ? String(api.errors[name]?.message ?? "") : undefined} className={`${cls} ${w} ${bad ? "bg-destructive/15" : ""}`} />;
}

function Echo({ value, w = "min-w-44" }: { value?: string; w?: string }) {
  return <span className={`mx-1 inline-block h-6 border-b border-[#1f6f3f] px-1 align-baseline text-sm text-black ${w}`}>{value}</span>;
}

function Gap({ w = "w-40" }: { w?: string }) {
  return <span className={`mx-1 inline-block h-5 border-b border-[#1f6f3f] align-bottom ${w}`} />;
}

function Heading({ children, sub }: { children: ReactNode; sub?: ReactNode }) {
  return (
    <div className="px-3 pt-2 text-center">
      <h2 className="font-display text-base font-bold tracking-wide">{children}</h2>
      {sub && <p className="text-[10px]">{sub}</p>}
    </div>
  );
}

function Check({ api, name, value, children }: { api: FormApi; name: string; value: string; children: ReactNode }) {
  return <label className="flex items-start gap-2"><input type="radio" value={value} {...api.register(name)} className="mt-2 h-4 w-4" /><span className="flex-1 leading-8">{children}</span></label>;
}

function Officer({ api, p }: { api: FormApi; p: string }) {
  return (
    <div className="mt-4 grid grid-cols-2 gap-x-8 gap-y-2 px-3 pb-3">
      <SigLine label="Signature of the Administering Officer" /><Line api={api} name={`${p}officer_position`} label="Position/Title/Designation" />
      <Line api={api} name={`${p}officer_name`} label="Name in Print" /><Line api={api} name={`${p}officer_address`} label="Address" />
    </div>
  );
}

export function Form102Page2({ api }: { api: FormApi }) {
  const w = api.watch;
  const own = w("dr_applicant_for") === "My own birth";
  const other = w("dr_applicant_for") === "The birth of another person";
  const married = w("dr_parents_status") === "Married";
  const notMarried = w("dr_parents_status") === "Not married";

  return (
    <div className={`border-2 ${B} bg-white text-xs text-black [&_input]:text-black [&_select]:text-black [&_textarea]:text-black`}>
      <Heading sub={<>(For births before 3 August 1988) &nbsp;&nbsp; (For births on or after 3 August 1988)</>}>AFFIDAVIT OF ACKNOWLEDGMENT/ADMISSION OF PATERNITY</Heading>
      <div className="space-y-1 px-3 pb-2 pt-2 leading-8">
        <p>I/We,<Blank api={api} name="pa_father_name" w="w-64" /> and <Blank api={api} name="pa_mother_name" w="w-64" />,</p>
        <p>of legal age, am/are the natural mother and/or father of <Blank api={api} name="pa_child_name" w="w-72" />, who was born on <Blank api={api} name="pa_child_birth_date" type="date" w="w-40" /> at <Blank api={api} name="pa_child_birth_place" w="w-72" />.</p>
        <p className="pl-6">I am / We are executing this affidavit to attest to the truthfulness of the foregoing statements and for purposes of acknowledging my/our child.</p>
        <div className="grid grid-cols-2 gap-8 pt-4">
          <div><div className={`h-6 border-b ${B}`}><span className="px-1 text-sm text-black">{w("pa_father_name")}</span></div><p className="text-center text-[10px] font-semibold">(Signature Over Printed Name of Father)</p></div>
          <div><div className={`h-6 border-b ${B}`}><span className="px-1 text-sm text-black">{w("pa_mother_name")}</span></div><p className="text-center text-[10px] font-semibold">(Signature Over Printed Name of Mother)</p></div>
        </div>
        <p className="pt-3"><b>SUBSCRIBED AND SWORN</b> to before me this <Blank api={api} name="pa_sworn_date" type="date" w="w-40" /> by <Echo value={w("pa_father_name")} /> and <Echo value={w("pa_mother_name")} />, who exhibited to me his/her CTC/valid ID <Blank api={api} name="pa_id_number" w="w-56" /> issued on <Blank api={api} name="pa_id_issued_on" type="date" w="w-40" /> at <Blank api={api} name="pa_id_issued_at" w="w-56" />.</p>
      </div>
      <Officer api={api} p="pa_" />

      <div className={`border-t ${B}`}>
        <Heading sub="(To be accomplished by the hospital/clinic administrator, father, mother, or guardian or the person himself if 18 years old or over.)">AFFIDAVIT FOR DELAYED REGISTRATION OF BIRTH</Heading>
        <div className="space-y-1 px-3 pb-2 pt-2 leading-8">
          <p>I<Blank api={api} name="dr_affiant_name" w="w-72" />, of legal age,
            <select defaultValue="" {...api.register("dr_civil_status")} className={`${cls} w-32 ${api.errors["dr_civil_status"] ? "bg-destructive/15" : ""}`}>
              <option value=""></option>{["Single", "Married", "Divorced", "Widow", "Widower"].map((o) => <option key={o}>{o}</option>)}
            </select>, with residence and postal address at <Blank api={api} name="dr_residence_address" w="w-80" /> after having been duly sworn in accordance with law, do hereby depose and say:</p>

          <div className="space-y-1 pl-4">
            <p className="font-semibold">1. That I am the applicant for the delayed registration of:</p>
            <div className="pl-8">
              <Check api={api} name="dr_applicant_for" value="My own birth">my birth in {own ? <Blank api={api} name="dr_birth_place" w="w-56" /> : <Gap w="w-56" />} on {own ? <Blank api={api} name="dr_birth_date" type="date" w="w-40" /> : <Gap w="w-40" />}</Check>
              <Check api={api} name="dr_applicant_for" value="The birth of another person">the birth of {other ? <Blank api={api} name="dr_subject_name" w="w-56" /> : <Gap w="w-56" />} who was born in {other ? <Blank api={api} name="dr_birth_place" w="w-56" /> : <Gap w="w-56" />} on {other ? <Blank api={api} name="dr_birth_date" type="date" w="w-40" /> : <Gap w="w-40" />}</Check>
            </div>
            <p><b>2.</b> That I/he/she was attended at birth by <Blank api={api} name="dr_attendant_name" w="w-64" /> who resides at <Blank api={api} name="dr_attendant_address" w="w-64" />.</p>
            <p><b>3.</b> That I am/he/she is a citizen of <Blank api={api} name="dr_citizenship" w="w-64" />.</p>
            <div>
              <p className="font-semibold">4. That my/his/her parents were</p>
              <div className="pl-8">
                <Check api={api} name="dr_parents_status" value="Married">married on {married ? <Blank api={api} name="dr_parents_marriage_date" type="date" w="w-40" /> : <Gap w="w-40" />} at {married ? <Blank api={api} name="dr_parents_marriage_place" w="w-64" /> : <Gap w="w-64" />}</Check>
                <Check api={api} name="dr_parents_status" value="Not married">not married but I/he/she was
                  {notMarried ? (
                    <select defaultValue="" {...api.register("dr_father_acknowledgment")} className={`${cls} w-40 ${api.errors["dr_father_acknowledgment"] ? "bg-destructive/15" : ""}`}>
                      <option value=""></option><option>Acknowledged</option><option>Not acknowledged</option>
                    </select>
                  ) : <Gap w="w-40" />}
                  by my/his/her father whose name is {notMarried ? <Blank api={api} name="dr_father_name" w="w-64" /> : <Gap w="w-64" />}</Check>
              </div>
            </div>
            <p><b>5.</b> That the reason for the delay in registering my/his/her birth was <Blank api={api} name="dr_delay_reason" w="w-[26rem]" />.</p>
            <p><b>6.</b> (For the applicant only) That I am married to <Blank api={api} name="dr_married_to" w="w-72" />.</p>
            <p className="pl-6">(If the applicant is other than the document owner) That I am the <Blank api={api} name="dr_relationship_to_owner" w="w-48" /> of the said person.</p>
            <p><b>7.</b> That I am executing this affidavit to attest to the truthfulness of the foregoing statements for all legal intents and purposes.</p>
          </div>

          <p className="pt-2">In truth whereof, I have affixed my signature below this <Blank api={api} name="dr_execution_date" type="date" w="w-40" /> at <Blank api={api} name="dr_execution_place" w="w-72" />, Philippines.</p>
          <div className="ml-auto w-80 pt-4">
            <div className={`h-6 border-b ${B}`}><span className="px-1 text-sm text-black">{w("dr_affiant_name")}</span></div>
            <p className="text-center text-[10px] font-semibold">(Signature Over Printed Name of Affiant)</p>
          </div>
          <p className="pt-3"><b>SUBSCRIBED AND SWORN</b> to before me this <Blank api={api} name="dr_sworn_date" type="date" w="w-40" /> at <Blank api={api} name="dr_sworn_place" w="w-64" />, Philippines, affiant who exhibited to me his/her CTC/valid ID <Blank api={api} name="dr_id_number" w="w-56" /> issued on <Blank api={api} name="dr_id_issued_on" type="date" w="w-40" /> at <Blank api={api} name="dr_id_issued_at" w="w-56" />.</p>
        </div>
        <Officer api={api} p="dr_" />
      </div>
    </div>
  );
}
