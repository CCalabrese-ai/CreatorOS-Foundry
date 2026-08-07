export function getSupabaseConfig(env = import.meta.env) {
  const url = env.VITE_SUPABASE_URL?.trim();
  const publishableKey = env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim();

  if (!url || !publishableKey || publishableKey.includes('replace-with')) {
    return { configured: false, url: null, publishableKey: null };
  }

  return { configured: true, url, publishableKey };
}
