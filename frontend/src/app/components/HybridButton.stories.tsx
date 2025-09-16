import type { Meta, StoryObj } from '@storybook/react'
import { HybridButton } from './HybridButton'

const meta: Meta<typeof HybridButton> = {
  title: 'Components/HybridButton',
  component: HybridButton,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A hybrid button component that combines Tailwind CSS utilities with CSS Modules for optimal styling flexibility.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['primary', 'secondary', 'outline', 'ghost', 'link'],
      description: 'The visual style variant of the button',
    },
    size: {
      control: { type: 'select' },
      options: ['small', 'medium', 'large', 'extraLarge'],
      description: 'The size of the button',
    },
    loading: {
      control: { type: 'boolean' },
      description: 'Shows a loading spinner and disables the button',
    },
    disabled: {
      control: { type: 'boolean' },
      description: 'Disables the button',
    },
    fullWidth: {
      control: { type: 'boolean' },
      description: 'Makes the button take full width of its container',
    },
    iconOnly: {
      control: { type: 'boolean' },
      description: 'Makes the button display only an icon',
    },
    iconPosition: {
      control: { type: 'select' },
      options: ['left', 'right'],
      description: 'Position of the icon relative to text',
    },
    children: {
      control: { type: 'text' },
      description: 'Button content',
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

// Default story
export const Default: Story = {
  args: {
    children: 'Button',
    variant: 'primary',
    size: 'medium',
  },
}

// Variant stories
export const Primary: Story = {
  args: {
    children: 'Primary Button',
    variant: 'primary',
  },
}

export const Secondary: Story = {
  args: {
    children: 'Secondary Button',
    variant: 'secondary',
  },
}

export const Outline: Story = {
  args: {
    children: 'Outline Button',
    variant: 'outline',
  },
}

export const Ghost: Story = {
  args: {
    children: 'Ghost Button',
    variant: 'ghost',
  },
}

export const Link: Story = {
  args: {
    children: 'Link Button',
    variant: 'link',
  },
}

// Size stories
export const Small: Story = {
  args: {
    children: 'Small Button',
    size: 'small',
  },
}

export const Medium: Story = {
  args: {
    children: 'Medium Button',
    size: 'medium',
  },
}

export const Large: Story = {
  args: {
    children: 'Large Button',
    size: 'large',
  },
}

export const ExtraLarge: Story = {
  args: {
    children: 'Extra Large Button',
    size: 'extraLarge',
  },
}

// State stories
export const Loading: Story = {
  args: {
    children: 'Loading Button',
    loading: true,
  },
}

export const Disabled: Story = {
  args: {
    children: 'Disabled Button',
    disabled: true,
  },
}

export const FullWidth: Story = {
  args: {
    children: 'Full Width Button',
    fullWidth: true,
  },
  parameters: {
    layout: 'padded',
  },
}

// Icon stories
export const WithIconLeft: Story = {
  args: {
    children: 'Add Item',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
      </svg>
    ),
    iconPosition: 'left',
  },
}

export const WithIconRight: Story = {
  args: {
    children: 'Download',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
      </svg>
    ),
    iconPosition: 'right',
  },
}

export const IconOnly: Story = {
  args: {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    ),
    iconOnly: true,
    'aria-label': 'Close',
  },
}

// Interactive stories
export const Interactive: Story = {
  args: {
    children: 'Click Me',
    onClick: () => alert('Button clicked!'),
  },
}

// All variants showcase
export const AllVariants: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <HybridButton variant="primary" size="small">Primary</HybridButton>
        <HybridButton variant="secondary" size="small">Secondary</HybridButton>
        <HybridButton variant="outline" size="small">Outline</HybridButton>
        <HybridButton variant="ghost" size="small">Ghost</HybridButton>
        <HybridButton variant="link" size="small">Link</HybridButton>
      </div>
    </div>
  ),
  parameters: {
    layout: 'padded',
  },
}

// All sizes showcase
export const AllSizes: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-4">
        <HybridButton variant="primary" size="small">Small</HybridButton>
        <HybridButton variant="primary" size="medium">Medium</HybridButton>
        <HybridButton variant="primary" size="large">Large</HybridButton>
        <HybridButton variant="primary" size="extraLarge">Extra Large</HybridButton>
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
      <div className="space-y-4">
        <h3 className="text-white text-lg font-semibold mb-4">Dark Mode Buttons</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          <HybridButton variant="primary">Primary</HybridButton>
          <HybridButton variant="secondary">Secondary</HybridButton>
          <HybridButton variant="outline">Outline</HybridButton>
          <HybridButton variant="ghost">Ghost</HybridButton>
          <HybridButton variant="link">Link</HybridButton>
        </div>
      </div>
    </div>
  ),
  parameters: {
    layout: 'padded',
    backgrounds: { default: 'dark' },
  },
}
