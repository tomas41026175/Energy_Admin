import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Input } from '../Input'

describe('Input', () => {
  it('renders without a label', () => {
    render(<Input placeholder="Enter value" />)
    expect(screen.getByPlaceholderText('Enter value')).toBeInTheDocument()
  })

  it('renders with a label linked to input', () => {
    render(<Input label="Username" />)
    expect(screen.getByLabelText('Username')).toBeInTheDocument()
  })

  it('displays error message with role alert', () => {
    render(<Input label="Email" error="Email is required" />)
    expect(screen.getByRole('alert')).toHaveTextContent('Email is required')
  })

  it('sets aria-invalid when error is provided', () => {
    render(<Input label="Email" error="Invalid email" />)
    expect(screen.getByLabelText('Email')).toHaveAttribute('aria-invalid', 'true')
  })

  it('sets aria-describedby to error id', () => {
    render(<Input label="Email" error="Invalid email" />)
    const input = screen.getByLabelText('Email')
    const errorId = input.getAttribute('aria-describedby')
    expect(errorId).toBeTruthy()
    const errorEl = document.getElementById(errorId!)
    expect(errorEl).toHaveTextContent('Invalid email')
  })

  it('displays helper text when no error', () => {
    render(<Input label="Password" helperText="Minimum 8 characters" />)
    expect(screen.getByText('Minimum 8 characters')).toBeInTheDocument()
  })

  it('does not display helper text when error is present', () => {
    render(<Input label="Password" error="Too short" helperText="Minimum 8 characters" />)
    expect(screen.queryByText('Minimum 8 characters')).not.toBeInTheDocument()
    expect(screen.getByRole('alert')).toHaveTextContent('Too short')
  })

  it('accepts user input', async () => {
    const user = userEvent.setup()
    render(<Input label="Username" />)
    const input = screen.getByLabelText('Username')
    await user.type(input, 'testuser')
    expect(input).toHaveValue('testuser')
  })

  it('is disabled when disabled prop is true', () => {
    render(<Input label="Username" disabled />)
    expect(screen.getByLabelText('Username')).toBeDisabled()
  })
})
