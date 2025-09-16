'use client'

import React from 'react'
import styles from '../../styles/modules/Button.module.scss'
import { cn } from '../../lib/utils'

interface HybridButtonProps {
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'link'
  size?: 'small' | 'medium' | 'large' | 'extraLarge'
  loading?: boolean
  disabled?: boolean
  fullWidth?: boolean
  iconOnly?: boolean
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'
  className?: string
  onClick?: () => void
  type?: 'button' | 'submit' | 'reset'
}

export function HybridButton({
  children,
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  fullWidth = false,
  iconOnly = false,
  icon,
  iconPosition = 'left',
  className,
  onClick,
  type = 'button',
}: HybridButtonProps) {
  // Use CSS modules for complex component-specific styles
  const buttonClasses = cn(
    styles.button,
    styles[variant],
    styles[size],
    {
      [styles.loading]: loading,
      [styles.fullWidth]: fullWidth,
      [styles.iconOnly]: iconOnly,
    },
    // Use Tailwind for utility classes and responsive design
    'focus:outline-none focus:ring-2 focus:ring-offset-2',
    'transition-all duration-200 ease-in-out',
    'disabled:cursor-not-allowed disabled:opacity-50',
    'sm:focus:ring-4', // Responsive focus ring
    className
  )

  const iconClasses = cn(
    styles.icon,
    styles[`icon--${iconPosition}`]
  )

  return (
    <button
      type={type}
      className={buttonClasses}
      disabled={disabled || loading}
      onClick={onClick}
      aria-disabled={disabled || loading}
    >
      {loading ? (
        <span className="sr-only">Loading...</span>
      ) : (
        <>
          {icon && iconPosition === 'left' && (
            <span className={iconClasses}>{icon}</span>
          )}
          {!iconOnly && <span>{children}</span>}
          {icon && iconPosition === 'right' && (
            <span className={iconClasses}>{icon}</span>
          )}
          {iconOnly && icon && <span className={iconClasses}>{icon}</span>}
        </>
      )}
    </button>
  )
}

// Example usage demonstrating hybrid approach
export function ButtonExamples() {
  return (
    <div className="space-y-4 p-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
        Hybrid Button Examples
      </h2>
      
      {/* Tailwind for layout and spacing */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        
        {/* Primary buttons with CSS modules for styling */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Primary Variants
          </h3>
          <div className="space-y-2">
            <HybridButton variant="primary" size="small">
              Small Primary
            </HybridButton>
            <HybridButton variant="primary" size="medium">
              Medium Primary
            </HybridButton>
            <HybridButton variant="primary" size="large">
              Large Primary
            </HybridButton>
          </div>
        </div>

        {/* Secondary buttons */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Secondary Variants
          </h3>
          <div className="space-y-2">
            <HybridButton variant="secondary" size="small">
              Small Secondary
            </HybridButton>
            <HybridButton variant="secondary" size="medium">
              Medium Secondary
            </HybridButton>
            <HybridButton variant="secondary" size="large">
              Large Secondary
            </HybridButton>
          </div>
        </div>

        {/* Outline buttons */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Outline Variants
          </h3>
          <div className="space-y-2">
            <HybridButton variant="outline" size="small">
              Small Outline
            </HybridButton>
            <HybridButton variant="outline" size="medium">
              Medium Outline
            </HybridButton>
            <HybridButton variant="outline" size="large">
              Large Outline
            </HybridButton>
          </div>
        </div>

        {/* Ghost buttons */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Ghost Variants
          </h3>
          <div className="space-y-2">
            <HybridButton variant="ghost" size="small">
              Small Ghost
            </HybridButton>
            <HybridButton variant="ghost" size="medium">
              Medium Ghost
            </HybridButton>
            <HybridButton variant="ghost" size="large">
              Large Ghost
            </HybridButton>
          </div>
        </div>

        {/* Link buttons */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Link Variants
          </h3>
          <div className="space-y-2">
            <HybridButton variant="link" size="small">
              Small Link
            </HybridButton>
            <HybridButton variant="link" size="medium">
              Medium Link
            </HybridButton>
            <HybridButton variant="link" size="large">
              Large Link
            </HybridButton>
          </div>
        </div>

        {/* Special states */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Special States
          </h3>
          <div className="space-y-2">
            <HybridButton variant="primary" loading>
              Loading Button
            </HybridButton>
            <HybridButton variant="primary" disabled>
              Disabled Button
            </HybridButton>
            <HybridButton variant="primary" fullWidth>
              Full Width Button
            </HybridButton>
          </div>
        </div>
      </div>

      {/* Icons with buttons */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Buttons with Icons
        </h3>
        <div className="flex flex-wrap gap-4">
          <HybridButton 
            variant="primary" 
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            }
            iconPosition="left"
          >
            Add Item
          </HybridButton>
          
          <HybridButton 
            variant="secondary" 
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
            }
            iconPosition="right"
          >
            Download
          </HybridButton>
          
          <HybridButton 
            variant="outline" 
            iconOnly
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            }
            aria-label="Close"
          />
        </div>
      </div>

      {/* Responsive behavior */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Responsive Behavior
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <HybridButton 
            variant="primary" 
            className="w-full sm:w-auto"
          >
            Responsive Button
          </HybridButton>
          <HybridButton 
            variant="secondary" 
            className="w-full sm:w-auto"
          >
            Responsive Button
          </HybridButton>
          <HybridButton 
            variant="outline" 
            className="w-full sm:w-auto"
          >
            Responsive Button
          </HybridButton>
          <HybridButton 
            variant="ghost" 
            className="w-full sm:w-auto"
          >
            Responsive Button
          </HybridButton>
        </div>
      </div>
    </div>
  )
}
