import { randomBytes } from 'node:crypto'
import { createClient } from '@supabase/supabase-js'

const accounts = [
  { email: 'demo.student@uniorder.test', name: 'Demo Student', role: 'Student' },
  { email: 'demo.finance@uniorder.test', name: 'Demo Finance', role: 'Finance' },
  { email: 'demo.admin@uniorder.test', name: 'Demo Administrator', role: 'Administrator' },
]

const supabaseUrl = process.env.SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error('Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your terminal environment.')
}

const projectUrl = new URL(supabaseUrl)
const isLocal = ['localhost', '127.0.0.1', '::1'].includes(projectUrl.hostname)
if (!isLocal) {
  const projectRef = projectUrl.hostname.split('.')[0]
  if (process.env.ALLOW_DEMO_ACCOUNTS !== 'true' || process.env.DEMO_PROJECT_REF !== projectRef) {
    throw new Error(
      `Refusing to create demo accounts in ${projectRef}. For an isolated demo project only, set `
      + 'ALLOW_DEMO_ACCOUNTS=true and DEMO_PROJECT_REF to that exact project ref.',
    )
  }
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
})

async function findExistingUser(email) {
  for (let page = 1; ; page += 1) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 1000 })
    if (error) throw error
    const user = data.users.find((candidate) => candidate.email?.toLowerCase() === email)
    if (user) return user
    if (data.users.length < 1000) return null
  }
}

for (const account of accounts) {
  const password = randomBytes(24).toString('base64url')
  const { data: created, error: createError } = await supabase.auth.admin.createUser({
    email: account.email,
    password,
    email_confirm: true,
    user_metadata: { full_name: account.name },
  })

  let user = created.user
  if (createError) {
    user = await findExistingUser(account.email)
    if (!user) throw new Error(`Unable to create ${account.email}: ${createError.message}`)

    const { data: updated, error: updateError } = await supabase.auth.admin.updateUserById(user.id, {
      password,
      email_confirm: true,
      user_metadata: { full_name: account.name },
    })
    if (updateError) throw new Error(`Unable to reset ${account.email}: ${updateError.message}`)
    user = updated.user
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .update({
      name: account.name,
      email: account.email,
      role: account.role,
      active: true,
      school_id: 'Demo',
    })
    .eq('id', user.id)
    .select('id')
    .maybeSingle()

  if (profileError || !profile) {
    throw new Error(
      `Auth user ${account.email} exists, but its profile role could not be set: `
      + (profileError?.message ?? 'profile not found'),
    )
  }

  console.log(`${account.role}\t${account.email}\t${password}`)
}

console.log('\nSave these generated passwords securely. Running this script again resets them.')
