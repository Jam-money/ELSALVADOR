import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const createEncoder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({
    email: z.string().trim().email(),
    password: z.string().min(6),
    full_name: z.string().trim().min(1).max(120),
    username: z.string().trim().min(2).max(40),
    position: z.string().trim().max(80),
  }))
  .handler(async ({ data, context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    if (!isAdmin) throw new Error("Only administrators can create staff accounts");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: created, error } = await supabaseAdmin.auth.admin.createUser({
      email: data.email, password: data.password, email_confirm: true, user_metadata: { full_name: data.full_name },
    });
    if (error || !created.user) throw new Error(error?.message ?? "Could not create user");
    const { error: pErr } = await supabaseAdmin.from("profiles").update({ username: data.username, position: data.position || null }).eq("id", created.user.id);
    if (pErr) throw new Error(pErr.message);
    return { id: created.user.id };
  });
