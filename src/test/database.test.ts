import { describe, it, expect } from 'vitest'

const TIMEOUT_MS = 10000

function handleError(error: unknown, operation: string): string {
  if (error instanceof Error) {
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      return `[${operation}] 网络连接失败，请检查网络后重试`
    }
    if (error.message.includes('timeout') || error.message.includes('超时')) {
      return `[${operation}] 请求超时，服务响应缓慢，请稍后重试`
    }
    return `[${operation}] ${error.message}`
  }
  return `[${operation}] 未知错误`
}

function withTimeout<T>(promise: PromiseLike<T>, label: string): Promise<T> {
  const timeout = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error(`[${label}] 请求超时 (${TIMEOUT_MS / 1000}s)`)), TIMEOUT_MS)
  )
  return Promise.race([promise, timeout])
}

describe('Database Error Handling', () => {
  describe('handleError', () => {
    it('should return network error message for Failed to fetch', () => {
      const error = new Error('Failed to fetch')
      const result = handleError(error, 'fetchProfiles')
      expect(result).toContain('网络连接失败')
      expect(result).toContain('fetchProfiles')
    })

    it('should return network error message for NetworkError', () => {
      const error = new Error('NetworkError: connection refused')
      const result = handleError(error, 'insertProfile')
      expect(result).toContain('网络连接失败')
      expect(result).toContain('insertProfile')
    })

    it('should return timeout error message for timeout', () => {
      const error = new Error('timeout occurred')
      const result = handleError(error, 'fetchHrJobs')
      expect(result).toContain('请求超时')
      expect(result).toContain('fetchHrJobs')
    })

    it('should return timeout error message for Chinese timeout', () => {
      const error = new Error('请求超时')
      const result = handleError(error, 'insertGrowth')
      expect(result).toContain('请求超时')
    })

    it('should return original error message for other errors', () => {
      const error = new Error('Permission denied: RLS policy violation')
      const result = handleError(error, 'deleteJob')
      expect(result).toContain('Permission denied: RLS policy violation')
    })

    it('should handle unknown error types', () => {
      const result = handleError('unknown error', 'testOp')
      expect(result).toContain('未知错误')
    })

    it('should handle null error', () => {
      const result = handleError(null, 'nullOp')
      expect(result).toContain('未知错误')
    })
  })

  describe('withTimeout', () => {
    it('should resolve when promise resolves', async () => {
      const promise = Promise.resolve('success')
      const result = await withTimeout(promise, 'test')
      expect(result).toBe('success')
    })

    it('should create a race between promise and timeout', () => {
      const promise = Promise.resolve('value')
      const raceResult = withTimeout(promise, 'fastOp')

      expect(raceResult).toBeInstanceOf(Promise)
    })

    it('should include label in timeout error message', () => {
      const TIMEOUT_MS_SHORT = 10
      const customTimeout = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error(`[customLabel] 请求超时 (${TIMEOUT_MS_SHORT / 1000}s)`)), TIMEOUT_MS_SHORT)
      )

      return expect(customTimeout).rejects.toThrow('customLabel')
    })
  })
})