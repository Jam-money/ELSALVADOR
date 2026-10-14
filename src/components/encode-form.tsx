import { Link } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { useForm, type FieldErrors, type Resolver, type UseFormRegister, type UseFormSetValue, type UseFormWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

export const req = z.string().trim().min(1, "Required").max(300);
export const opt = z.string().trim().max(1000).optional();
export const num = z.string().trim().regex(/^\d+$/, "Numbers only");
export const dateReq = z.string().min(1, "Required");

export type Def = { name: string; label: string; type?: string; options?: string[]; wide?: boolean };
export type SectionDef = { title: string; fields: Def[] };
export type Values = Record<string, string>;
export type FormApi = { register: UseFormRegister<Values>; watch: UseFormWatch<Values>; setValue: UseFormSetValue<Values>; errors: FieldErrors<Values>; required: (name: string) => boolean; refNo: string };
export type EncodeSchema = z.ZodObject<Record<string, z.ZodTypeAny>> | z.ZodEffects<z.ZodObject<Record<string, z.ZodTypeAny>>>;

export const toNum = (s?: string) => (s ? Number(s) : null);
export const nul = (s?: string) => (s && s.trim() ? s.trim() : null);
export const join = (...p: (string | undefined)[]) => p.filter(Boolean).join(" ");

const inputCls = "w-full rounded-md border border-input bg-background px-3 text-sm outline-none transition-colors focus:border-gold focus:ring-2 focus:ring-gold/40";

const tabs = [
  { to: "/births/new" as const, key: "birth", label: "Page 1 \u00b7 Certificate of Live Birth" },
  { to: "/births/page-2" as const, key: "page2", label: "Page 2 \u00b7 Affidavits" },
];

export function EncodeForm<S extends EncodeSchema>({ tab, eyebrow, title, refPrefix = "", fixedRefNo, schema, sections = [], layout, submitLabel = "Save", defaults, onSkip, skipLabel = "Skip", onSubmit }: {
  tab: "birth" | "page2"; eyebrow: string; title: string; refPrefix?: string; fixedRefNo?: string; schema: S; sections?: SectionDef[]; layout?: (api: FormApi) => ReactNode; submitLabel?: string; defaults?: Values | undefined; onSkip?: () => void; skipLabel?: string;
  onSubmit: (v: z.infer<S>, refNo: string) => Promise<void>;
}) {
  const base: EncodeSchema = schema;
  const shape = (base instanceof z.ZodEffects ? base.innerType() : base).shape;
  const [refNo] = useState(() => fixedRefNo ?? `${refPrefix}${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`);
  const { register, watch, setValue, handleSubmit, formState: { errors, isSubmitting } } = useForm<Values>({ ...(defaults ? { defaultValues: defaults } : {}), resolver: zodResolver(schema) as unknown as Resolver<Values> });

  return (
    <form onSubmit={handleSubmit((v) => onSubmit(v as z.infer<S>, refNo))} className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-wrap gap-2">
        {tabs.map((t) => (
          <span key={t.key} aria-current={t.key === tab ? "step" : undefined} className={`cursor-default select-none rounded-md border px-4 py-1.5 text-sm font-medium ${t.key === tab ? "border-primary bg-primary text-primary-foreground" : "bg-card text-muted-foreground"}`}>{t.label}</span>
        ))}
      </div>
      <div className="flex flex-wrap items-end justify-between gap-4 border-b pb-4">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">{eyebrow}</p>
          <h1 className="text-3xl">{title}</h1>
        </div>
      </div>

      {layout && (
        <div className="overflow-x-auto">
          <div className="min-w-[760px]">{layout({ register, watch, setValue, errors, required: (n) => !shape[n]?.isOptional(), refNo })}</div>
          {Object.keys(errors).length > 0 && <p className="mt-2 text-sm text-destructive">Please complete the highlighted fields ({Object.keys(errors).length}).</p>}
        </div>
      )}

      {sections.map((s) => (
        <section key={s.title} className="rounded-lg border border-t-2 border-t-gold bg-card px-6 py-5">
          <h2 className="border-b pb-2 text-lg">{s.title}</h2>
          <div className="mt-5 grid gap-x-5 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
            {s.fields.map((f) => {
              const required = !shape[f.name]?.isOptional();
              const err = errors[f.name]?.message as string | undefined;
              return (
                <div key={f.name} className={`flex flex-col justify-end gap-1.5 ${f.wide ? "sm:col-span-2 lg:col-span-3" : ""}`}>
                  <label htmlFor={f.name} className="text-sm font-medium leading-tight">
                    {f.label}{required && <span className="text-destructive"> *</span>}
                  </label>
                  {f.options ? (
                    <select id={f.name} defaultValue="" {...register(f.name)} className={`${inputCls} h-9`}>
                      <option value="">Select…</option>
                      {f.options.map((o) => <option key={o}>{o}</option>)}
                    </select>
                  ) : f.type === "textarea" ? (
                    <textarea id={f.name} rows={4} {...register(f.name)} className={`${inputCls} py-2`} />
                  ) : (
                    <input id={f.name} type={f.type ?? "text"} min={f.type === "number" ? 0 : undefined} {...register(f.name)} className={`${inputCls} h-9`} />
                  )}
                  {err && <p className="text-xs text-destructive">{err}</p>}
                </div>
              );
            })}
          </div>
        </section>
      ))}

      <div className="flex justify-end gap-3 pb-6">
        <Link to="/births" className="rounded-md border bg-background px-5 py-2 text-sm font-medium hover:bg-accent">Cancel</Link>
        {onSkip && <button type="button" onClick={onSkip} className="px-3 py-2 text-sm font-medium text-primary underline">{skipLabel}</button>}
        <button type="submit" disabled={isSubmitting} className="rounded-md bg-primary px-5 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60">{submitLabel}</button>
      </div>
    </form>
  );
}
