import { createClient, type SupabaseClient } from '@supabase/supabase-js'

let _supabase: SupabaseClient | null = null
let _initError: string | null = null

function getEnv(): { url: string; key: string } {
  const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined
  if (!url || !key) {
    throw new Error(
      'Supabase credentials are missing. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env'
    )
  }
  return { url, key }
}

export function getSupabase(): SupabaseClient {
  if (_supabase) return _supabase
  try {
    const { url, key } = getEnv()
    _supabase = createClient(url, key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false,
      },
      realtime: {
        params: {
          eventsPerSecond: 2,
        },
      },
    })
    return _supabase
  } catch (err) {
    _initError = err instanceof Error ? err.message : 'Supabase 初始化失败'
    throw err
  }
}

export function isSupabaseConfigured(): boolean {
  try {
    getEnv()
    return true
  } catch {
    return false
  }
}

export function getSupabaseInitError(): string | null {
  return _initError
}

export const supabase = new Proxy({} as SupabaseClient, {
  get(_, prop) {
    const client = getSupabase()
    const value = (client as unknown as Record<string | symbol, unknown>)[prop]
    if (typeof value === 'function') {
      return (...args: unknown[]) => (value as (...a: unknown[]) => unknown).apply(client, args)
    }
    return value
  },
})

export async function ensureAnonymousSession(): Promise<string | null> {
  if (!isSupabaseConfigured()) {
    console.warn('[Supabase] 未配置凭据，跳过匿名认证')
    return null
  }
  try {
    const client = getSupabase()

    const sessionResult = await withTimeout(
      client.auth.getSession(),
      5000,
      null as unknown as Awaited<ReturnType<typeof client.auth.getSession>>
    )

    if (sessionResult !== null) {
      const { data } = sessionResult
      if (data.session) return data.session.user.id
    } else {
      console.warn('[Supabase] 获取会话超时，跳过匿名认证')
      return null
    }

    const anonEmail = `anon_${crypto.randomUUID().substring(0, 8)}@anonymous.local`
    const anonPassword = crypto.randomUUID()

    const signUpDataResult = await withTimeout(
      client.auth.signUp({
        email: anonEmail,
        password: anonPassword,
      }),
      5000,
      null as unknown as Awaited<ReturnType<typeof client.auth.signUp>>
    )

    if (signUpDataResult === null) {
      console.warn('[Supabase] 匿名注册超时，跳过匿名认证')
      return null
    }

    const { data: signUpData, error } = signUpDataResult

    if (error) {
      console.warn('[Supabase] 匿名认证失败，继续离线模式:', error.message)
      return null
    }

    if (signUpData.session) {
      return signUpData.user?.id ?? null
    }

    if (signUpData.user) {
      const signInResult = await withTimeout(
        client.auth.signInWithPassword({
          email: anonEmail,
          password: anonPassword,
        }),
        5000,
        null as unknown as Awaited<ReturnType<typeof client.auth.signInWithPassword>>
      )

      if (signInResult !== null) {
        const { data: signInData } = signInResult
        if (signInData.session) {
          return signInData.user?.id ?? signUpData.user.id
        }
      }

      console.warn('[Supabase] 匿名用户无会话（邮箱确认未通过），降级返回 userId')
      return signUpData.user.id
    }

    return null
  } catch (err) {
    console.warn('[Supabase] 匿名认证异常，继续离线模式:', err instanceof Error ? err.message : err)
    return null
  }
}

export function getClientInfo() {
  return {
    url: import.meta.env.VITE_SUPABASE_URL as string | undefined || '',
    connected: _supabase !== null && _initError === null,
  }
}

const DEMO_EMAIL = 'demo@zhizhao.internal'
const DEMO_PASSWORD = (import.meta.env.VITE_DEMO_PASSWORD as string | undefined) || 'ZhizhaoDemo2026!'

export function getDemoCredentials() {
  return { email: DEMO_EMAIL, password: DEMO_PASSWORD }
}

export async function getExistingSession(): Promise<{ userId: string; email: string } | null> {
  if (!isSupabaseConfigured()) return null
  try {
    const client = getSupabase()
    const { data } = await client.auth.getSession()
    if (data.session?.user) {
      return {
        userId: data.session.user.id,
        email: data.session.user.email || '',
      }
    }
    return null
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.warn('[Supabase] 获取已有会话失败:', msg)
    if (isRateLimitError(err)) {
      console.warn('[Supabase] 频率限制，等待后重试...')
    }
    return null
  }
}

function withTimeout<T>(promise: Promise<T>, ms: number, fallback: T): Promise<T> {
  if (ms <= 0) return promise
  return Promise.race([
    promise,
    new Promise<T>((resolve) => {
      setTimeout(() => {
        console.warn(`[Supabase] 操作超时 (${ms}ms)，使用降级方案`)
        resolve(fallback)
      }, ms)
    }),
  ])
}

export async function getExistingSessionWithTimeout(ms = 4000): Promise<{ userId: string; email: string } | null> {
  return withTimeout(getExistingSession(), ms, null)
}

const GUEST_ID_KEY = 'zhizhao_guest_user_id'

function createLocalGuestId(): string {
  const existing = localStorage.getItem(GUEST_ID_KEY)
  if (existing) return existing
  const id = `guest_${crypto.randomUUID()}`
  localStorage.setItem(GUEST_ID_KEY, id)
  return id
}

function isRateLimitError(err: unknown): boolean {
  const msg = (err as { message?: string })?.message || ''
  return msg.toLowerCase().includes('rate limit') || msg.toLowerCase().includes('rate_limit')
}

export async function signInDemoAccount(): Promise<{ userId: string; isSharedAccount: boolean }> {
  if (!isSupabaseConfigured()) {
    const guestId = createLocalGuestId()
    console.warn('[DemoAuth] Supabase 未配置，进入本地访客模式')
    return { userId: guestId, isSharedAccount: false }
  }
  const client = getSupabase()

  const signInPromise = client.auth.signInWithPassword({
    email: DEMO_EMAIL,
    password: DEMO_PASSWORD,
  })

  const signInResult = await withTimeout(
    signInPromise,
    6000,
    null as unknown as Awaited<typeof signInPromise>
  )

  if (signInResult === null) {
    console.warn('[DemoAuth] 登录超时，尝试使用已有会话或本地模式')
    const existingSession = await getExistingSessionWithTimeout(2000)
    if (existingSession) {
      return { userId: existingSession.userId, isSharedAccount: true }
    }
    const guestId = createLocalGuestId()
    return { userId: guestId, isSharedAccount: false }
  }

  const { data: signInData, error: signInError } = signInResult

  if (!signInError && signInData.session) {
    return { userId: signInData.user!.id, isSharedAccount: true }
  }

  if (signInError && signInError.message?.includes('Invalid login credentials')) {
    const signUpPromise = client.auth.signUp({
      email: DEMO_EMAIL,
      password: DEMO_PASSWORD,
    })

    const signUpResult = await withTimeout(
      signUpPromise,
      6000,
      null as unknown as Awaited<typeof signUpPromise>
    )

    if (signUpResult === null) {
      console.warn('[DemoAuth] 注册超时，进入本地访客模式')
      const guestId = createLocalGuestId()
      return { userId: guestId, isSharedAccount: false }
    }

    const { data: signUpData, error: signUpError } = signUpResult

    if (signUpError) {
      console.warn('[DemoAuth] 创建体验账号失败:', signUpError.message)

      if (isRateLimitError(signUpError)) {
        console.warn('[DemoAuth] 注册频率限制，检查已有会话')
        const existingSession = await getExistingSessionWithTimeout(2000)
      if (existingSession) {
        return { userId: existingSession.userId, isSharedAccount: true }
      }
      const guestId = createLocalGuestId()
      console.warn('[DemoAuth] 无已有会话，进入本地访客模式')
      return { userId: guestId, isSharedAccount: false }
    }

    const existingSession = await getExistingSessionWithTimeout(2000)
    if (existingSession) {
      return { userId: existingSession.userId, isSharedAccount: true }
    }
    const guestId = createLocalGuestId()
    console.warn('[DemoAuth] 认证失败，进入本地访客模式')
    return { userId: guestId, isSharedAccount: false }
    }

    if (signUpData.session) {
      return { userId: signUpData.user!.id, isSharedAccount: true }
    }

    if (signUpData.user) {
      const retryPromise = client.auth.signInWithPassword({
        email: DEMO_EMAIL,
        password: DEMO_PASSWORD,
      })

      const retryResult = await withTimeout(
        retryPromise,
        4000,
        null as unknown as Awaited<typeof retryPromise>
      )

      if (retryResult !== null) {
        const { data: retryData, error: retryError } = retryResult

        if (!retryError && retryData.session) {
          return { userId: retryData.user!.id, isSharedAccount: true }
        }

        if (isRateLimitError(retryError)) {
          console.warn('[DemoAuth] 登录频率限制，进入本地访客模式')
          const guestId = createLocalGuestId()
          return { userId: guestId, isSharedAccount: false }
        }
      }

      console.warn('[DemoAuth] 体验账号需要邮箱确认，尝试已有会话')
      await client.auth.signOut().catch(() => {})

      const existingSession = await getExistingSessionWithTimeout(2000)
      if (existingSession) {
        console.warn('[DemoAuth] 使用已有会话进入')
        return { userId: existingSession.userId, isSharedAccount: true }
      }

      const guestId = createLocalGuestId()
      console.warn('[DemoAuth] 进入本地访客模式')
      return { userId: guestId, isSharedAccount: false }
    }
  }

  console.warn('[DemoAuth] 登录失败:', signInError?.message)

  if (signInError && isRateLimitError(signInError)) {
    const existingSession = await getExistingSessionWithTimeout(2000)
    if (existingSession) {
      return { userId: existingSession.userId, isSharedAccount: true }
    }
  }

  const existingSession = await getExistingSessionWithTimeout(2000)
  if (existingSession) {
    return { userId: existingSession.userId, isSharedAccount: true }
  }

  const guestId = createLocalGuestId()
  console.warn('[DemoAuth] 进入本地访客模式')
  return { userId: guestId, isSharedAccount: false }
}

export async function signOutDemoAccount(): Promise<void> {
  try {
    const client = getSupabase()
    await client.auth.signOut()
  } catch {
    console.warn('[Supabase] 登出失败')
  }
}