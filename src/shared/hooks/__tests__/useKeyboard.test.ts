import { renderHook } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useKeyboard } from '../useKeyboard'

describe('useKeyboard', () => {
  let addSpy: ReturnType<typeof vi.spyOn>
  let removeSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    addSpy = vi.spyOn(window, 'addEventListener')
    removeSpy = vi.spyOn(window, 'removeEventListener')
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('adds keydown listener on mount', () => {
    const handler = vi.fn()
    renderHook(() => useKeyboard('Escape', handler))
    expect(addSpy).toHaveBeenCalledWith('keydown', expect.any(Function))
  })

  it('removes keydown listener on unmount', () => {
    const handler = vi.fn()
    const { unmount } = renderHook(() => useKeyboard('Escape', handler))
    unmount()
    expect(removeSpy).toHaveBeenCalledWith('keydown', expect.any(Function))
  })

  it('calls handler when matching key pressed', () => {
    const handler = vi.fn()
    renderHook(() => useKeyboard('Enter', handler))
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }))
    expect(handler).toHaveBeenCalledOnce()
  })

  it('does not call handler for non-matching key', () => {
    const handler = vi.fn()
    renderHook(() => useKeyboard('Enter', handler))
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    expect(handler).not.toHaveBeenCalled()
  })

  it('does not add listener when enabled=false', () => {
    const handler = vi.fn()
    renderHook(() => useKeyboard('Escape', handler, false))
    expect(addSpy).not.toHaveBeenCalledWith('keydown', expect.any(Function))
  })

  it('does not call handler when enabled=false', () => {
    const handler = vi.fn()
    renderHook(() => useKeyboard('Escape', handler, false))
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    expect(handler).not.toHaveBeenCalled()
  })
})
