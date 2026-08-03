import { createClient } from '@/lib/supabase'

export async function getServerUser({ request, cookies }: { request: Request; cookies: any }) {
  const supabase = createClient({ request, cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const username = user.user_metadata?.username
  const firstName = user.user_metadata?.first_name || ''
  const lastName = user.user_metadata?.last_name || ''
  const fullName = `${firstName} ${lastName}`.trim()
  const email = user.email || ''
  const usernameFromEmail = email.split('@')[0]

  const displayName =
    username ||
    (fullName ? fullName : null) ||
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    (usernameFromEmail ? usernameFromEmail.charAt(0).toUpperCase() + usernameFromEmail.slice(1) : 'User')

  return {
    name: displayName,
    email,
    avatar: user.user_metadata?.avatar_url || '/avatars/shadcn.jpg',
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
    username || fullName || rawUser.user_metadata?.full_name || rawUser.user_metadata?.name || (usernameFromEmail ? usernameFromEmail.charAt(0).toUpperCase() + usernameFromEmail.slice(1) : 'User')
  return { name: displayName, email, avatar: rawUser.user_metadata?.avatar_url || '/avatars/shadcn.jpg', raw: rawUser }
}
