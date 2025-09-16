import type { Meta, StoryObj } from '@storybook/react'
import styles from '../../styles/modules/Card.module.scss'
import { cn } from '../../lib/utils'

// Card component for Storybook
interface CardProps {
  variant?: 'default' | 'elevated' | 'flat' | 'outlined'
  size?: 'small' | 'medium' | 'large'
  interactive?: boolean
  clickable?: boolean
  className?: string
  children: React.ReactNode
}

function Card({
  variant = 'default',
  size = 'medium',
  interactive = false,
  clickable = false,
  className,
  children,
}: CardProps) {
  return (
    <div
      className={cn(
        styles.card,
        styles[variant],
        styles[size],
        {
          [styles.interactive]: interactive,
          [styles.clickable]: clickable,
        },
        className
      )}
    >
      {children}
    </div>
  )
}

const meta: Meta<typeof Card> = {
  title: 'Components/Card',
  component: Card,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A flexible card component with multiple variants and interactive states.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['default', 'elevated', 'flat', 'outlined'],
      description: 'The visual style variant of the card',
    },
    size: {
      control: { type: 'select' },
      options: ['small', 'medium', 'large'],
      description: 'The size of the card',
    },
    interactive: {
      control: { type: 'boolean' },
      description: 'Makes the card interactive with hover effects',
    },
    clickable: {
      control: { type: 'boolean' },
      description: 'Makes the card clickable with press effects',
    },
    children: {
      control: { type: 'text' },
      description: 'Card content',
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

// Default story
export const Default: Story = {
  args: {
    children: (
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
          Default Card
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          This is a default card with basic styling.
        </p>
      </div>
    ),
  },
}

// Variant stories
export const Elevated: Story = {
  args: {
    variant: 'elevated',
    children: (
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
          Elevated Card
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          This card has an elevated shadow for more prominence.
        </p>
      </div>
    ),
  },
}

export const Flat: Story = {
  args: {
    variant: 'flat',
    children: (
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
          Flat Card
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          This card has a flat design with minimal shadows.
        </p>
      </div>
    ),
  },
}

export const Outlined: Story = {
  args: {
    variant: 'outlined',
    children: (
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
          Outlined Card
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          This card has a prominent border outline.
        </p>
      </div>
    ),
  },
}

// Size stories
export const Small: Story = {
  args: {
    size: 'small',
    children: (
      <div>
        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">
          Small Card
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          This is a small card with compact padding.
        </p>
      </div>
    ),
  },
}

export const Medium: Story = {
  args: {
    size: 'medium',
    children: (
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
          Medium Card
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          This is a medium card with standard padding.
        </p>
      </div>
    ),
  },
}

export const Large: Story = {
  args: {
    size: 'large',
    children: (
      <div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
          Large Card
        </h3>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          This is a large card with generous padding.
        </p>
      </div>
    ),
  },
}

// Interactive stories
export const Interactive: Story = {
  args: {
    interactive: true,
    children: (
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
          Interactive Card
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Hover over this card to see the interactive effects.
        </p>
      </div>
    ),
  },
}

export const Clickable: Story = {
  args: {
    clickable: true,
    children: (
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
          Clickable Card
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Click this card to see the press effects.
        </p>
      </div>
    ),
  },
}

// Complex card examples
export const StatCard: Story = {
  render: () => (
    <div className={cn(styles.card, styles.statCard)}>
      <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mx-auto mb-4">
        <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      </div>
      <h3 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1">1,234</h3>
      <p className="text-sm text-gray-600 dark:text-gray-400">Total Documents</p>
      <div className="text-xs text-green-600 dark:text-green-400 mt-2">
        +12% from last month
      </div>
    </div>
  ),
}

export const FeatureCard: Story = {
  render: () => (
    <div className={cn(styles.card, styles.featureCard)}>
      <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mx-auto mb-4">
        <svg className="w-8 h-8 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
        AI-Powered Analysis
      </h3>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        Leverage advanced AI to analyze your documents and extract meaningful insights.
      </p>
      <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
        Learn More
      </button>
    </div>
  ),
}

export const ProductCard: Story = {
  render: () => (
    <div className={cn(styles.card, styles.productCard, 'relative')}>
      <div className="w-full h-48 bg-gradient-to-br from-blue-400 to-purple-500 rounded-t-lg"></div>
      <div className="p-6">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Premium Plan
          </h3>
          <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
            Popular
          </span>
        </div>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Advanced features for professional teams
        </p>
        <div className="flex items-center mb-4">
          <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">$29</span>
          <span className="text-gray-600 dark:text-gray-400 ml-1">/month</span>
        </div>
        <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors">
          Get Started
        </button>
      </div>
    </div>
  ),
}

// Card with sections
export const WithSections: Story = {
  render: () => (
    <div className={cn(styles.card, styles.elevated)}>
      <div className={styles.card__header}>
        <div>
          <h3 className={styles.card__title}>Card with Sections</h3>
          <p className={styles.card__subtitle}>A card with header, body, and footer</p>
        </div>
        <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div className={styles.card__body}>
        <p className="text-gray-600 dark:text-gray-400">
          This is the main content area of the card. It can contain any type of content
          including text, images, forms, or other components.
        </p>
      </div>
      <div className={styles.card__footer}>
        <button className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200">
          Cancel
        </button>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
          Save Changes
        </button>
      </div>
    </div>
  ),
}

// All variants showcase
export const AllVariants: Story = {
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className={cn(styles.card)}>
        <div className="p-4">
          <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Default</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">Basic card styling</p>
        </div>
      </div>
      <div className={cn(styles.card, styles.elevated)}>
        <div className="p-4">
          <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Elevated</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">Enhanced shadow</p>
        </div>
      </div>
      <div className={cn(styles.card, styles.flat)}>
        <div className="p-4">
          <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Flat</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">Minimal shadows</p>
        </div>
      </div>
      <div className={cn(styles.card, styles.outlined)}>
        <div className="p-4">
          <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Outlined</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">Prominent border</p>
        </div>
      </div>
    </div>
  ),
  parameters: {
    layout: 'padded',
  },
}

// Dark mode showcase
export const DarkMode: Story = {
  render: () => (
    <div className="dark bg-gray-900 p-6 rounded-lg">
      <h3 className="text-white text-lg font-semibold mb-4">Dark Mode Cards</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className={cn(styles.card)}>
          <div className="p-4">
            <h4 className="font-semibold text-gray-100 mb-2">Default</h4>
            <p className="text-sm text-gray-400">Basic card styling</p>
          </div>
        </div>
        <div className={cn(styles.card, styles.elevated)}>
          <div className="p-4">
            <h4 className="font-semibold text-gray-100 mb-2">Elevated</h4>
            <p className="text-sm text-gray-400">Enhanced shadow</p>
          </div>
        </div>
        <div className={cn(styles.card, styles.interactive)}>
          <div className="p-4">
            <h4 className="font-semibold text-gray-100 mb-2">Interactive</h4>
            <p className="text-sm text-gray-400">Hover effects</p>
          </div>
        </div>
      </div>
    </div>
  ),
  parameters: {
    layout: 'padded',
    backgrounds: { default: 'dark' },
  },
}
