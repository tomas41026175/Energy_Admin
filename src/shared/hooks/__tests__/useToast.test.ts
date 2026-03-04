import { describe, it, expect, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { createElement, type ReactNode } from 'react'
import { ToastContext, type ToastContextValue } from '../useToast'
import { useToast } from '../useToast'

describe('useToast', () => {
  it('throws when used outside ToastProvider', () => {
    // Suppress expected error output
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    expect(() => {
      renderHook(() => useToast())
    }).toThrow('useToast must be used within ToastProvider')
    consoleError.mockRestore()
  })

  it('returns context value when used within provider', () => {
    const mockValue: ToastContextValue = {
      toasts: [],
      addToast: vi.fn(),
      removeToast: vi.fn(),
    }

    const Wrapper = ({ children }: { children: ReactNode }) =>
      createElement(ToastContext.Provider, { value: mockValue }, children)

    const { result } = renderHook(() => useToast(), { wrapper: Wrapper })

    expect(result.current.toasts).toEqual([])
    expect(typeof result.current.addToast).toBe('function')
    expect(typeof result.current.removeToast).toBe('function')
  })

  it('addToast calls the provided function with type and message', () => {
    const mockAddToast = vi.fn()
    const mockValue: ToastContextValue = {
      toasts: [],
      addToast: mockAddToast,
      removeToast: vi.fn(),
    }

    const Wrapper = ({ children }: { children: ReactNode }) =>
      createElement(ToastContext.Provider, { value: mockValue }, children)

    const { result } = renderHook(() => useToast(), { wrapper: Wrapper })

    act(() => {
      result.current.addToast('success', '操作成功')
    })

    expect(mockAddToast).toHaveBeenCalledWith('success', '操作成功')
  })

  it('removeToast calls the provided function with id', () => {
    const mockRemoveToast = vi.fn()
    const mockValue: ToastContextValue = {
      toasts: [{ id: 'toast-1', type: 'info', message: '測試' }],
      addToast: vi.fn(),
      removeToast: mockRemoveToast,
    }

    const Wrapper = ({ children }: { children: ReactNode }) =>
      createElement(ToastContext.Provider, { value: mockValue }, children)

    const { result } = renderHook(() => useToast(), { wrapper: Wrapper })

    act(() => {
      result.current.removeToast('toast-1')
    })

    expect(mockRemoveToast).toHaveBeenCalledWith('toast-1')
  })
})
