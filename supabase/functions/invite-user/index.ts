import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': Deno.env.get('APP_URL') ?? 'null',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

function respond(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }
  if (request.method !== 'POST') return respond(405, { error: 'Method not allowed.' })

  const authorization = request.headers.get('Authorization')
  if (!authorization) return respond(401, { error: 'Sign in as an administrator to send invitations.' })

  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY')
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  const appUrl = Deno.env.get('APP_URL')
  if (!supabaseUrl || !anonKey || !serviceRoleKey || !appUrl) {
    return respond(500, { error: 'The invitation service is not configured.' })
  }

  const callerClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authorization } },
    auth: { persistSession: false, autoRefreshToken: false },
  })
  const { data: { user }, error: userError } = await callerClient.auth.getUser()
  if (userError || !user) return respond(401, { error: 'Your session is invalid. Sign in again.' })

  const { data: caller, error: callerError } = await callerClient
    .from('profiles')
    .select('role, active')
    .eq('id', user.id)
    .single()
  if (callerError || !caller || caller.role !== 'Administrator' || !caller.active) {
    return respond(403, { error: 'Administrator access is required to send invitations.' })
  }

  let payload: Record<string, unknown>
  try {
    const body: unknown = await request.json()
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return respond(400, { error: 'Provide a valid invitation request.' })
    }
    payload = body as Record<string, unknown>
  } catch {
    return respond(400, { error: 'Provide a valid invitation request.' })
  }
  const name = typeof payload.name === 'string' ? payload.name.trim() : ''
  const email = typeof payload.email === 'string' ? payload.email.trim().toLowerCase() : ''
  const role = payload.role
  const group = typeof payload.group === 'string' ? payload.group.trim().slice(0, 80) : ''
  if (!name || name.length > 80 || !email || email.length > 120
    || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    || typeof role !== 'string'
    || !['Student', 'Finance', 'Administrator'].includes(role)) {
    return respond(400, { error: 'Enter a valid name, email, and role.' })
  }

  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  const { data, error } = await adminClient.auth.admin.inviteUserByEmail(email, {
    data: { full_name: name },
    redirectTo: `${appUrl.replace(/\/$/, '')}/login`,
  })
  if (error || !data.user) {
    return respond(400, { error: error?.message ?? 'Unable to create the invitation.' })
  }

  const { error: profileError } = await adminClient
    .from('profiles')
    .update({ name, email, role, school_id: group })
    .eq('id', data.user.id)
  if (profileError) {
    console.error('Invitation sent, but the profile update failed.', profileError)
    return respond(500, { error: 'The invitation email was sent, but its account role could not be saved. Contact support before the user signs in.' })
  }

  return respond(200, { invited: true })
})
