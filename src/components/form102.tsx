import type { ReactNode } from "react";
import type { FormApi } from "@/components/encode-form";

const B = "border-[#1f6f3f]";

export function Row({ cols, children }: { cols: string; children: ReactNode }) {
  return <div className={`grid divide-x divide-[#1f6f3f] border-t ${B}`} style={{ gridTemplateColumns: cols }}>{children}</div>;
}

export function Cell({ cap, children }: { cap?: string; children: ReactNode }) {
  return (
    <div className="min-w-0 px-1.5 pb-1 pt-0.5">
      {cap && <p className="text-[10px] font-semibold uppercase leading-tight">{cap}</p>}
      {children}
    </div>
  );
}

const underline = "h-7 w-full border-0 border-b border-dotted border-[#1f6f3f]/70 bg-transparent px-1 text-sm outline-none focus:bg-gold/10";

export function In({ api, name, sub, type = "text", suffix }: { api: FormApi; name: string; sub?: string; type?: string; suffix?: string }) {
  const bad = !!api.errors[name];
  return (
    <label className="relative flex min-w-0 flex-col">
      {sub && <span className="text-center text-[10px] leading-tight text-neutral-800">{sub}</span>}
      <span className="flex items-end">
        <input type={type} min={type === "number" ? 0 : undefined} placeholder=" " {...api.register(name)} title={bad ? String(api.errors[name]?.message ?? "") : undefined}
          className={`peer ${underline} ${bad ? "bg-destructive/15" : ""}`} />
        {suffix && <span className="pb-0.5 pl-1 text-xs">{suffix}</span>}
      </span>
      {api.required(name) && type !== "date" && type !== "time" && <span className="pointer-events-none absolute right-1 top-1/2 hidden text-xs text-destructive peer-placeholder-shown:block">*</span>}
    </label>
  );
}

export function Sel({ api, name, options, sub }: { api: FormApi; name: string; options: string[]; sub?: string }) {
  const bad = !!api.errors[name];
  return (
    <label className="flex min-w-0 flex-col">
      {sub && <span className="text-center text-[10px] leading-tight text-neutral-800">{sub}</span>}
      <select defaultValue="" {...api.register(name)} className={`${underline} ${bad ? "bg-destructive/15" : ""}`}>
        <option value=""></option>
        {options.map((o) => <option key={o}>{o}</option>)}
      </select>
    </label>
  );
}

export function Line({ api, name, label, type = "text" }: { api: FormApi; name: string; label: string; type?: string }) {
  const bad = !!api.errors[name];
  return (
    <label className="flex items-end gap-1.5 text-xs">
      <span className="shrink-0 pb-0.5">{label}</span>
      <input type={type} {...api.register(name)} title={bad ? String(api.errors[name]?.message ?? "") : undefined}
        className={`h-6 min-w-0 flex-1 border-0 border-b border-[#1f6f3f] bg-transparent px-1 text-sm outline-none focus:bg-gold/10 ${bad ? "bg-destructive/15" : ""}`} />
    </label>
  );
}

export function SigLine({ label }: { label: string }) {
  return <div className="flex items-end gap-1.5 text-xs"><span className="shrink-0">{label}</span><span className="h-6 flex-1 border-b border-[#1f6f3f]" /></div>;
}

function Side({ letters, children }: { letters: string; children: ReactNode }) {
  return (
    <div className={`flex border-t ${B}`}>
      <div className={`flex w-8 shrink-0 flex-col items-center justify-center border-r ${B} text-sm font-bold leading-tight`}>{letters.split("").map((l, i) => <span key={i}>{l}</span>)}</div>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}

const trio = (api: FormApi, p: string, subs = ["(First)", "(Middle)", "(Last)"]) => (
  <div className="grid grid-cols-3 gap-2">{["first_name", "middle_name", "last_name"].map((k, i) => <In key={k} api={api} name={`${p}_${k}`} sub={subs[i]!} />)}</div>
);

const residence = (api: FormApi, p: string, cap: string) => (
  <Cell cap={cap}>
    <div className="grid grid-cols-4 gap-2">
      <In api={api} name={`${p}_residence`} sub="(House No., St., Barangay)" /><In api={api} name={`${p}_city`} sub="(City/Municipality)" />
      <In api={api} name={`${p}_province`} sub="(Province)" /><In api={api} name={`${p}_country`} sub="(Country)" />
    </div>
  </Cell>
);

const codeItems: [number, number[]][] = [[8, [2]], [9, [2]], [11, [3]], [13, [3, 3, 2]], [15, [2]], [16, [2]], [17, [3]], [19, [3, 3, 2]]];

function CodeBoxes({ api, item, groups }: { api: FormApi; item: number; groups: number[] }) {
  const name = `office_code_${item}`;
  const total = groups.reduce((a, b) => a + b, 0);
  const chars = (api.watch(name) ?? "").padEnd(total, " ").split("");
  const id = (i: number) => `${name}_${i}`;
  const set = (i: number, ch: string) => {
    const next = [...chars];
    next[i] = ch || " ";
    api.setValue(name, next.join("").trimEnd(), { shouldDirty: true });
  };
  let idx = 0;
  return (
    <div>
      <input type="hidden" {...api.register(name)} />
      <p className="text-[10px] font-semibold">{item}</p>
      <div className="flex">
        {groups.map((g, gi) => (
          <div key={gi} className={`flex ${gi > 0 ? "ml-1" : ""}`}>
            {Array.from({ length: g }, () => {
              const i = idx++;
              return (
                <input key={i} id={id(i)} maxLength={1} value={chars[i]!.trim()} autoComplete="off"
                  onChange={(e) => { const ch = e.target.value.slice(-1).toUpperCase(); set(i, ch); if (ch && i < total - 1) document.getElementById(id(i + 1))?.focus(); }}
                  onKeyDown={(e) => { if (e.key === "Backspace" && !chars[i]!.trim() && i > 0) document.getElementById(id(i - 1))?.focus(); }}
                  className={`h-7 w-5 border border-[#1f6f3f] bg-transparent p-0 text-center text-sm outline-none focus:bg-gold/20`} />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

const attendants = ["Physician", "Nurse", "Midwife", "Hilot (Traditional Birth Attendant)"];

export function Form102({ api }: { api: FormApi }) {
  const r = api.register;
  return (
    <div className={`border-2 ${B} bg-white text-xs text-black [&_input]:text-black [&_select]:text-black [&_textarea]:text-black`}>
      <div className="flex justify-between gap-4 px-2 pt-1 text-[10px]">
        <span>Municipal Form No. 102<br />(Revised August 2016)</span>
        <span>(To be accomplished in quadruplicate using black ink)</span>
      </div>
      <div className="pb-1 text-center">
        <p className="text-[11px]">Republic of the Philippines</p>
        <p className="text-[11px]">OFFICE OF THE CIVIL REGISTRAR GENERAL</p>
        <h2 className="font-display text-2xl font-bold tracking-wide">CERTIFICATE OF LIVE BIRTH</h2>
      </div>

      <Row cols="1fr 240px">
        <div className="space-y-1 px-2 py-1.5">
          <Line api={api} name="reg_province" label="Province" />
          <Line api={api} name="reg_city" label="City/Municipality" />
        </div>
        <div className="px-2 py-1.5"><p className="text-[11px] font-semibold">Registry No.</p><p className="font-display text-sm text-black">{api.refNo}</p></div>
      </Row>

      <Side letters="CHILD">
        <Cell cap="1. Name">{trio(api, "child")}</Cell>
        <Row cols="1fr 2fr">
          <Cell cap="2. Sex (Male / Female)">
            <div className="flex gap-4 pt-1.5">{["Male", "Female"].map((s) => <label key={s} className="flex items-center gap-1"><input type="radio" value={s} {...r("sex")} />{s}</label>)}</div>
            {api.errors["sex"] && <p className="text-[10px] text-destructive">Required</p>}
          </Cell>
          <Cell cap="3. Date of Birth (Day / Month / Year)"><In api={api} name="date_of_birth" type="date" /></Cell>
        </Row>
        <Row cols="1.4fr 1fr 1fr">
          <Cell cap="4. Place of Birth"><In api={api} name="hospital" sub="(Name of Hospital/Clinic/Institution/House No., St., Barangay)" /></Cell>
          <Cell><In api={api} name="birth_city" sub="(City/Municipality)" /></Cell>
          <Cell><In api={api} name="birth_province" sub="(Province)" /></Cell>
        </Row>
        <Row cols="1fr 1fr 1fr 1fr">
          <Cell cap="5a. Type of Birth"><Sel api={api} name="type_of_birth" sub="(Single, Twin, Triplet, etc.)" options={["Single", "Twin", "Triplet", "Others"]} /></Cell>
          <Cell cap="5b. If Multiple Birth, Child Was"><Sel api={api} name="multiple_birth_order" sub="(First, Second, Third, etc.)" options={["First", "Second", "Third", "Others"]} /></Cell>
          <Cell cap="5c. Birth Order"><Sel api={api} name="birth_order" sub="(First, Second, Third, etc.)" options={["First", "Second", "Third", "Fourth", "Fifth", "Sixth or more"]} /></Cell>
          <Cell cap="6. Weight at Birth"><In api={api} name="birth_weight_grams" type="number" suffix="grams" /></Cell>
        </Row>
      </Side>

      <Side letters="MOTHER">
        <Cell cap="7. Maiden Name">{trio(api, "mother")}</Cell>
        <Row cols="1fr 1fr">
          <Cell cap="8. Citizenship"><In api={api} name="mother_citizenship" /></Cell>
          <Cell cap="9. Religion/Religious Sect"><In api={api} name="mother_religion" /></Cell>
        </Row>
        <Row cols="1fr 1fr 1fr 1.4fr 1fr">
          <Cell cap="10a. Total No. of Children Born Alive"><In api={api} name="mother_total_children" type="number" /></Cell>
          <Cell cap="10b. No. of Children Still Living Including This Birth"><In api={api} name="mother_children_living" type="number" /></Cell>
          <Cell cap="10c. No. of Children Born Alive but Are Now Dead"><In api={api} name="mother_children_dead" type="number" /></Cell>
          <Cell cap="11. Occupation"><In api={api} name="mother_occupation" /></Cell>
          <Cell cap="12. Age at the Time of This Birth (Completed Years)"><In api={api} name="mother_age" type="number" /></Cell>
        </Row>
        <div className={`border-t ${B}`}>{residence(api, "mother", "13. Residence")}</div>
      </Side>

      <Side letters="FATHER">
        <Cell cap="14. Name">{trio(api, "father")}</Cell>
        <Row cols="1fr 1fr 1fr 1fr">
          <Cell cap="15. Citizenship"><In api={api} name="father_citizenship" /></Cell>
          <Cell cap="16. Religion/Religious Sect"><In api={api} name="father_religion" /></Cell>
          <Cell cap="17. Occupation"><In api={api} name="father_occupation" /></Cell>
          <Cell cap="18. Age at the Time of This Birth (Completed Years)"><In api={api} name="father_age" type="number" /></Cell>
        </Row>
        <div className={`border-t ${B}`}>{residence(api, "father", "19. Residence")}</div>
      </Side>

      <div className={`border-t ${B} px-2 pt-1 text-[11px]`}><b>MARRIAGE OF PARENTS</b> (If not married, accomplish Affidavit of Acknowledgement/Admission of Paternity at the back.)</div>
      <Row cols="1fr 2fr">
        <Cell cap="20a. Date (Month / Day / Year)"><In api={api} name="parents_marriage_date" type="date" /></Cell>
        <Cell cap="20b. Place">
          <div className="grid grid-cols-3 gap-2">
            <In api={api} name="parents_marriage_city" sub="(City/Municipality)" /><In api={api} name="parents_marriage_province" sub="(Province)" /><In api={api} name="parents_marriage_country" sub="(Country)" />
          </div>
        </Cell>
      </Row>

      <div className={`border-t ${B} px-2 py-1`}>
        <p className="text-[10px] font-semibold uppercase">21a. Attendant</p>
        <div className="mt-1 flex flex-wrap items-center gap-x-5 gap-y-1">
          {attendants.map((o, i) => <label key={o} className="flex items-center gap-1"><input type="radio" value={o} {...r("attendant_type")} />{i + 1} {o}</label>)}
          <label className="flex items-center gap-1"><input type="radio" value="Others" {...r("attendant_type")} />5 Others (Specify)</label>
          <input {...r("attendant_other")} className="h-6 min-w-32 flex-1 border-0 border-b border-[#1f6f3f] bg-transparent px-1 text-sm outline-none focus:bg-gold/10" />
        </div>
        {api.errors["attendant_type"] && <p className="text-[10px] text-destructive">Select the attendant</p>}
        <p className="mt-2 text-[10px] font-semibold uppercase">21b. Certification of Attendant at Birth <span className="font-normal normal-case">(Physician, Nurse, Midwife, Traditional Birth Attendant/Hilot, etc.)</span></p>
        <p className="mt-1 flex flex-wrap items-end gap-2 pl-6">I hereby certify that I attended the birth of the child who was born alive at
          <input type="time" {...r("time_of_birth")} className={`h-6 w-32 border-0 border-b border-[#1f6f3f] bg-transparent px-1 text-sm outline-none focus:bg-gold/10 ${api.errors["time_of_birth"] ? "bg-destructive/15" : ""}`} />
          am/pm on the date of birth specified above.</p>
        <div className="mt-2 grid grid-cols-2 gap-x-6 gap-y-1.5">
          <SigLine label="Signature" /><Line api={api} name="attendant_address" label="Address" />
          <Line api={api} name="attendant_name" label="Name in Print" /><div />
          <Line api={api} name="attendant_title" label="Title or Position" /><Line api={api} name="attendant_cert_date" label="Date" type="date" />
        </div>
      </div>

      <div className={`grid grid-cols-2 divide-x divide-[#1f6f3f] border-t ${B}`}>
        <div className="space-y-1.5 p-2">
          <p className="text-[10px] font-semibold uppercase">22. Certification of Informant</p>
          <p className="pl-4">I hereby certify that all information supplied are true and correct to my own knowledge and belief.</p>
          <SigLine label="Signature" /><Line api={api} name="informant_name" label="Name in Print" />
          <Line api={api} name="informant_relationship" label="Relationship to the Child" /><Line api={api} name="informant_address" label="Address" />
          <Line api={api} name="informant_date" label="Date" type="date" />
        </div>
        <div className="space-y-1.5 p-2">
          <p className="text-[10px] font-semibold uppercase">23. Prepared By</p>
          <SigLine label="Signature" /><Line api={api} name="prepared_by_name" label="Name in Print" />
          <Line api={api} name="prepared_by_title" label="Title or Position" /><Line api={api} name="prepared_by_date" label="Date" type="date" />
        </div>
      </div>
      <div className={`grid grid-cols-2 divide-x divide-[#1f6f3f] border-t ${B}`}>
        <div className="space-y-1.5 p-2">
          <p className="text-[10px] font-semibold uppercase">24. Received By</p>
          <SigLine label="Signature" /><Line api={api} name="received_by_name" label="Name in Print" />
          <Line api={api} name="received_by_title" label="Title or Position" /><Line api={api} name="received_by_date" label="Date" type="date" />
        </div>
        <div className="space-y-1.5 p-2">
          <p className="text-[10px] font-semibold uppercase">25. Registered at the Office of the Civil Registrar</p>
          <SigLine label="Signature" /><Line api={api} name="registered_by_name" label="Name in Print" />
          <Line api={api} name="registered_by_title" label="Title or Position" /><Line api={api} name="registered_by_date" label="Date" type="date" />
        </div>
      </div>

      <div className={`border-t ${B} p-2`}>
        <p className="text-[10px] font-semibold uppercase">Remarks/Annotations <span className="font-normal normal-case">(For LCRO/OCRG Use Only)</span></p>
        <textarea rows={5} {...r("remarks")} className="mt-1 w-full resize-y border-0 bg-transparent px-1 text-sm outline-none focus:bg-gold/10" />
      </div>

      <div className={`border-t ${B} p-2`}>
        <p className="text-[10px] font-semibold uppercase">To Be Filled-Up at the Office of the Civil Registrar</p>
        <div className="mt-1 flex flex-nowrap items-end justify-between gap-x-2">
          {codeItems.map(([n, groups]) => <CodeBoxes key={n} api={api} item={n} groups={groups} />)}
        </div>
      </div>
    </div>
  );
}
