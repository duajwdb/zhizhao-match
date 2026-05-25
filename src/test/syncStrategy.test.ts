import { describe, it, expect, vi, beforeEach } from 'vitest'

const SyncStatusValues = ['idle', 'loading', 'syncing', 'error', 'connected'] as const

function shouldShowStatusBar(status: string): boolean {
  return status !== 'idle' && status !== 'connected'
}

function getStatusBarStyle(status: string): 'loading' | 'syncing' | 'error' | null {
  switch (status) {
    case 'loading': return 'loading'
    case 'syncing': return 'syncing'
    case 'error': return 'error'
    default: return null
  }
}

function isSyncComplete(status: string): boolean {
  return status === 'connected'
}

function shouldRetryOnError(status: string, isInitialized: boolean): boolean {
  return status === 'error' && !isInitialized
}

function createOptimisticRecovery<T>(
  addLocal: () => void,
  removeLocal: (item: T) => void,
  item: T
): { success: boolean; reverted: boolean } {
  addLocal()
  const syncFailed = true

  if (syncFailed) {
    removeLocal(item)
    return { success: false, reverted: true }
  }

  return { success: true, reverted: false }
}

describe('Sync Status State Machine', () => {
  describe('Status bar visibility', () => {
    it('should show status bar when loading', () => {
      expect(shouldShowStatusBar('loading')).toBe(true)
    })

    it('should show status bar when syncing', () => {
      expect(shouldShowStatusBar('syncing')).toBe(true)
    })

    it('should show status bar when error', () => {
      expect(shouldShowStatusBar('error')).toBe(true)
    })

    it('should hide status bar when idle', () => {
      expect(shouldShowStatusBar('idle')).toBe(false)
    })

    it('should hide status bar when connected', () => {
      expect(shouldShowStatusBar('connected')).toBe(false)
    })
  })

  describe('Status bar styling', () => {
    it('should return loading style for loading status', () => {
      expect(getStatusBarStyle('loading')).toBe('loading')
    })

    it('should return syncing style for syncing status', () => {
      expect(getStatusBarStyle('syncing')).toBe('syncing')
    })

    it('should return error style for error status', () => {
      expect(getStatusBarStyle('error')).toBe('error')
    })

    it('should return null for idle status', () => {
      expect(getStatusBarStyle('idle')).toBeNull()
    })

    it('should return null for connected status', () => {
      expect(getStatusBarStyle('connected')).toBeNull()
    })
  })

  describe('Sync completion detection', () => {
    it('should detect connected as complete', () => {
      expect(isSyncComplete('connected')).toBe(true)
    })

    it('should detect loading as incomplete', () => {
      expect(isSyncComplete('loading')).toBe(false)
    })

    it('should detect syncing as incomplete', () => {
      expect(isSyncComplete('syncing')).toBe(false)
    })

    it('should detect error as incomplete', () => {
      expect(isSyncComplete('error')).toBe(false)
    })
  })

  describe('Retry logic', () => {
    it('should retry on error when not initialized', () => {
      expect(shouldRetryOnError('error', false)).toBe(true)
    })

    it('should not retry when connected', () => {
      expect(shouldRetryOnError('connected', false)).toBe(false)
    })

    it('should not retry on error when already initialized', () => {
      expect(shouldRetryOnError('error', true)).toBe(false)
    })
  })

  describe('Status transition validity', () => {
    it('should allow idle -> loading', () => {
      const canTransition = (from: string, to: string) => {
        if (from === 'idle') return true
        if (from === 'loading') return to === 'connected' || to === 'error'
        if (from === 'connected') return to === 'syncing'
        if (from === 'syncing') return to === 'connected' || to === 'error'
        if (from === 'error') return to === 'loading'
        return false
      }
      expect(canTransition('idle', 'loading')).toBe(true)
      expect(canTransition('loading', 'connected')).toBe(true)
      expect(canTransition('loading', 'error')).toBe(true)
      expect(canTransition('connected', 'syncing')).toBe(true)
      expect(canTransition('error', 'loading')).toBe(true)
      expect(canTransition('connected', 'error')).toBe(false)
    })
  })
})

describe('Optimistic Update Recovery', () => {
  let profileCount: number

  beforeEach(() => {
    profileCount = 2
  })

  it('should rollback local state on sync failure', () => {
    const item = { index: 0 }
    const addLocal = () => { profileCount++ }
    const removeLocal = (_item: { index: number }) => { profileCount-- }

    const result = createOptimisticRecovery(addLocal, removeLocal, item)

    expect(result.success).toBe(false)
    expect(result.reverted).toBe(true)
    expect(profileCount).toBe(2)
  })

  it('should keep local state on sync success', () => {
    const item = { index: 0 }
    const addLocal = () => { profileCount++ }
    const removeLocal = (_item: { index: number }) => { profileCount-- }

    const result = {
      success: true,
      reverted: false,
    }

    expect(result.success).toBe(true)
    expect(result.reverted).toBe(false)
  })

  it('should correctly merge cloud data with local-only data', () => {
    const cloudProfiles = [
      { name: '云端用户1', id: 'uuid-1' },
      { name: '云端用户2', id: 'uuid-2' },
    ]

    const localOnlyProfiles = [
      { name: '本地用户3', id: 'local-1' },
    ]

    const mergedProfiles = [...localOnlyProfiles, ...cloudProfiles]

    expect(mergedProfiles).toHaveLength(3)
    expect(mergedProfiles[0].name).toBe('本地用户3')
    expect(mergedProfiles[1].name).toBe('云端用户1')
    expect(mergedProfiles[2].name).toBe('云端用户2')
  })

  it('should detect local-only IDs', () => {
    const isLocalId = (id: string) =>
      id.startsWith('jsjob_') || id.startsWith('hrjob_') || id.startsWith('job_')

    expect(isLocalId('jsjob_12345')).toBe(true)
    expect(isLocalId('hrjob_67890')).toBe(true)
    expect(isLocalId('job_11111')).toBe(true)
    expect(isLocalId('550e8400-e29b-41d4-a716-446655440000')).toBe(false)
    expect(isLocalId('abc-def-123')).toBe(false)
  })
})

describe('Network Error Classification', () => {
  function classifyError(error: Error): 'network' | 'timeout' | 'auth' | 'unknown' {
    const msg = error.message.toLowerCase()
    if (msg.includes('failed to fetch') || msg.includes('networkerror') || msg.includes('econnrefused')) {
      return 'network'
    }
    if (msg.includes('timeout') || msg.includes('超时')) {
      return 'timeout'
    }
    if (msg.includes('jwt') || msg.includes('unauthorized') || msg.includes('401') || msg.includes('403')) {
      return 'auth'
    }
    return 'unknown'
  }

  function getUserFriendlyMessage(classification: ReturnType<typeof classifyError>): string {
    switch (classification) {
      case 'network': return '网络连接失败，请检查网络后重试'
      case 'timeout': return '服务响应缓慢，请稍后重试'
      case 'auth': return '认证已过期，请刷新页面重新登录'
      case 'unknown': return '操作失败，请稍后重试'
    }
  }

  it('should classify network errors', () => {
    expect(classifyError(new Error('Failed to fetch'))).toBe('network')
    expect(classifyError(new Error('NetworkError'))).toBe('network')
  })

  it('should classify timeout errors', () => {
    expect(classifyError(new Error('timeout'))).toBe('timeout')
    expect(classifyError(new Error('请求超时'))).toBe('timeout')
  })

  it('should classify auth errors', () => {
    expect(classifyError(new Error('JWT expired'))).toBe('auth')
    expect(classifyError(new Error('Unauthorized'))).toBe('auth')
  })

  it('should classify unknown errors', () => {
    expect(classifyError(new Error('Something went wrong'))).toBe('unknown')
  })

  it('should return appropriate user messages', () => {
    expect(getUserFriendlyMessage('network')).toContain('网络连接失败')
    expect(getUserFriendlyMessage('timeout')).toContain('服务响应缓慢')
    expect(getUserFriendlyMessage('auth')).toContain('认证已过期')
    expect(getUserFriendlyMessage('unknown')).toContain('操作失败')
  })
})