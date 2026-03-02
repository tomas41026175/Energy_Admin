import '@testing-library/jest-dom/vitest'

// Polyfill ResizeObserver for jsdom (required by @headlessui/react)
global.ResizeObserver = class ResizeObserver {
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
}
