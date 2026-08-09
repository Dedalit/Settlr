import { createClient } from '@/lib/supabase'

export async function getServerUser({ request, cookies }: { request: Request; cookies: any }) {
  const supabase = createClient({ request, cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  // Fetch the authoritative profile from public.users
  let dbFullName: string | null = null
  let dbUsername: string | null = null
  let dbEmail: string | null = null
  let dbAvatar: string | null = null
  const { data: profile } = await supabase
    .from('users')
    .select('full_name, username, email, avatar_url')
    .eq('auth_id', user.id)
    .single()
  if (profile) {
    dbFullName = profile.full_name || null
    dbUsername = profile.username || null
    dbEmail = profile.email || null
    dbAvatar = profile.avatar_url || null
  }

  const username = dbUsername || user.user_metadata?.username
  const firstName = user.user_metadata?.first_name || ''
  const lastName = user.user_metadata?.last_name || ''
  const metaFullName = `${firstName} ${lastName}`.trim()
  const email = dbEmail || user.email || ''
  const usernameFromEmail = email.split('@')[0]

  // The display name is the full name, with username as fallback
  const displayName =
    dbFullName ||
    username ||
    (metaFullName ? metaFullName : null) ||
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    (usernameFromEmail ? usernameFromEmail.charAt(0).toUpperCase() + usernameFromEmail.slice(1) : 'User')

  return {
    name: displayName,
    email,
    avatar: dbAvatar || user.user_metadata?.avatar_url || '/avatars/shadcn.jpg',
    raw: user,
  }
}

export function formatServerUser(rawUser: any) {
  if (!rawUser) return null
  const username = rawUser.user_metadata?.username
  const firstName = rawUser.user_metadata?.first_name || ''
  const lastName = rawUser.user_metadata?.last_name || ''
  const fullName = `${firstName} ${lastName}`.trim()
  const email = rawUser.email || ''
  const usernameFromEmail = email.split('@')[0]
  const displayName =
    rawUser.user_metadata?.full_name ||
    (fullName ? fullName : null) ||
    username ||
    rawUser.user_metadata?.name ||
    (usernameFromEmail ? usernameFromEmail.charAt(0).toUpperCase() + usernameFromEmail.slice(1) : 'User')
  return { name: displayName, email, avatar: rawUser.user_metadata?.avatar_url || '/avatars/shadcn.jpg', raw: rawUser }
}
