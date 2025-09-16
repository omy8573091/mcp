# Storybook Component Library Guide

## 🎯 **Overview**

This guide covers the Storybook setup for the GRC Component Library, enabling you to create, document, and share reusable components across different products for a uniform look and feel.

## 🏗️ **Architecture**

### **Component Library Structure**
```
frontend/
├── .storybook/                    # Storybook configuration
│   ├── main.ts                   # Main configuration
│   └── preview.ts                # Preview configuration
├── src/
│   ├── app/components/           # React components
│   │   ├── HybridButton.tsx     # Hybrid button component
│   │   ├── HybridButton.stories.tsx # Button stories
│   │   └── Card.stories.tsx     # Card stories
│   ├── stories/                 # Storybook-specific stories
│   │   └── DesignSystem.stories.tsx # Design system overview
│   ├── styles/                  # Styles and CSS modules
│   │   ├── modules/             # CSS modules
│   │   ├── components.scss      # Global component styles
│   │   └── variables.scss       # SCSS variables
│   └── components/              # Component library exports
│       └── index.ts             # Main export file
├── component-library.json       # Component library package.json
└── STORYBOOK_GUIDE.md          # This guide
```

## 🚀 **Getting Started**

### **1. Install Dependencies**
```bash
npm install
```

### **2. Start Storybook**
```bash
npm run storybook
```

### **3. Build Storybook**
```bash
npm run build-storybook
```

## 📚 **Story Types**

### **1. Component Stories**
Individual component stories with different variants and states.

```tsx
// HybridButton.stories.tsx
import type { Meta, StoryObj } from '@storybook/react'
import { HybridButton } from './HybridButton'

const meta: Meta<typeof HybridButton> = {
  title: 'Components/HybridButton',
  component: HybridButton,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A hybrid button component...',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['primary', 'secondary', 'outline', 'ghost', 'link'],
    },
    size: {
      control: { type: 'select' },
      options: ['small', 'medium', 'large', 'extraLarge'],
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    children: 'Button',
    variant: 'primary',
    size: 'medium',
  },
}
```

### **2. Design System Stories**
Comprehensive design system overview including colors, typography, and spacing.

```tsx
// DesignSystem.stories.tsx
export const ColorPalette: Story = {
  render: () => (
    <div className="p-8 space-y-8">
      <h2 className="text-2xl font-bold">Color Palette</h2>
      {/* Color palette implementation */}
    </div>
  ),
}
```

### **3. Showcase Stories**
Multiple components displayed together for comparison.

```tsx
export const AllVariants: Story = {
  render: () => (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
      <HybridButton variant="primary">Primary</HybridButton>
      <HybridButton variant="secondary">Secondary</HybridButton>
      {/* More variants */}
    </div>
  ),
}
```

## 🎨 **Story Organization**

### **Story Hierarchy**
```
📁 Design System/
  ├── Overview
  ├── Color Palette
  ├── Typography
  ├── Spacing
  ├── Shadows
  └── Border Radius

📁 Components/
  ├── HybridButton/
  │   ├── Default
  │   ├── Variants
  │   ├── Sizes
  │   ├── States
  │   └── With Icons
  ├── Card/
  │   ├── Default
  │   ├── Variants
  │   ├── Sizes
  │   └── Interactive
  └── Form Elements/

📁 Layout/
  ├── Grid System
  ├── Navigation
  └── Sidebar

📁 Patterns/
  ├── Dashboard
  ├── Forms
  └── Data Display
```

## 🛠️ **Configuration**

### **Main Configuration (.storybook/main.ts)**
```typescript
import type { StorybookConfig } from '@storybook/nextjs'

const config: StorybookConfig = {
  stories: [
    '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)',
    '../src/**/*.story.@(js|jsx|mjs|ts|tsx)',
  ],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
  ],
  framework: {
    name: '@storybook/nextjs',
    options: {},
  },
  docs: {
    autodocs: 'tag',
  },
  webpackFinal: async (config) => {
    // SCSS support
    config.module?.rules?.push({
      test: /\.scss$/,
      use: [
        'style-loader',
        'css-loader',
        {
          loader: 'sass-loader',
          options: {
            additionalData: `@import "../src/styles/variables.scss";`,
          },
        },
      ],
    })
    return config
  },
}
```

### **Preview Configuration (.storybook/preview.ts)**
```typescript
import type { Preview } from '@storybook/react'
import { withThemeByClassName } from '@storybook/addon-themes'
import '../src/styles/globals.css'

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      default: 'light',
      values: [
        { name: 'light', value: '#ffffff' },
        { name: 'dark', value: '#0f172a' },
        { name: 'gray', value: '#f8fafc' },
      ],
    },
  },
  decorators: [
    withThemeByClassName({
      themes: {
        light: 'light',
        dark: 'dark',
      },
      defaultTheme: 'light',
    }),
  ],
}
```

## 📖 **Documentation**

### **Auto-generated Docs**
Stories with the `autodocs` tag automatically generate documentation:

```tsx
const meta: Meta<typeof HybridButton> = {
  title: 'Components/HybridButton',
  component: HybridButton,
  tags: ['autodocs'], // Enables auto-generated docs
  parameters: {
    docs: {
      description: {
        component: 'A hybrid button component that combines Tailwind CSS utilities with CSS Modules.',
      },
    },
  },
}
```

### **Custom Documentation**
Add custom documentation using MDX:

```tsx
// Button.mdx
import { Meta, Story, Canvas } from '@storybook/blocks'
import { HybridButton } from './HybridButton'

<Meta title="Components/HybridButton" component={HybridButton} />

# HybridButton

A flexible button component that supports multiple variants and sizes.

## Usage

```tsx
<HybridButton variant="primary" size="large">
  Click me
</HybridButton>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| variant | string | 'primary' | Button style variant |
| size | string | 'medium' | Button size |
| disabled | boolean | false | Disable the button |
```

## 🎭 **Controls & Interactions**

### **Controls**
Interactive controls for component props:

```tsx
argTypes: {
  variant: {
    control: { type: 'select' },
    options: ['primary', 'secondary', 'outline', 'ghost', 'link'],
    description: 'The visual style variant of the button',
  },
  size: {
    control: { type: 'range', min: 1, max: 10, step: 1 },
    description: 'The size of the button',
  },
  loading: {
    control: { type: 'boolean' },
    description: 'Shows a loading spinner',
  },
}
```

### **Actions**
Track user interactions:

```tsx
export const Interactive: Story = {
  args: {
    onClick: () => alert('Button clicked!'),
  },
}
```

## 🌙 **Theming**

### **Theme Support**
Built-in theme switching:

```tsx
// Preview configuration
decorators: [
  withThemeByClassName({
    themes: {
      light: 'light',
      dark: 'dark',
    },
    defaultTheme: 'light',
  }),
]
```

### **Background Options**
Multiple background options for testing:

```tsx
backgrounds: {
  default: 'light',
  values: [
    { name: 'light', value: '#ffffff' },
    { name: 'dark', value: '#0f172a' },
    { name: 'gray', value: '#f8fafc' },
  ],
}
```

## 📱 **Responsive Testing**

### **Viewport Addon**
Test components at different screen sizes:

```tsx
parameters: {
  viewport: {
    viewports: {
      mobile: {
        name: 'Mobile',
        styles: { width: '375px', height: '667px' },
      },
      tablet: {
        name: 'Tablet',
        styles: { width: '768px', height: '1024px' },
      },
      desktop: {
        name: 'Desktop',
        styles: { width: '1024px', height: '768px' },
      },
    },
  },
}
```

## 🧪 **Testing**

### **Interaction Testing**
Test user interactions:

```tsx
import { userEvent, within } from '@storybook/test'

export const InteractionTest: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const button = canvas.getByRole('button')
    
    await userEvent.click(button)
    // Test interactions
  },
}
```

### **Visual Testing**
Screenshot testing for visual regression:

```tsx
export const VisualTest: Story = {
  parameters: {
    chromatic: { disableSnapshot: false },
  },
}
```

## 📦 **Component Library Export**

### **Export Structure**
```typescript
// src/components/index.ts
export { HybridButton } from '../app/components/HybridButton'
export { ThemeToggle } from '../app/components/ThemeToggle'
export { useTheme } from '../app/hooks/useTheme'
export { cn } from '../lib/utils'
```

### **Package Configuration**
```json
{
  "name": "@grc/component-library",
  "version": "1.0.0",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "peerDependencies": {
    "react": ">=18.0.0",
    "react-dom": ">=18.0.0"
  }
}
```

## 🚀 **Deployment**

### **Static Build**
Build Storybook for static hosting:

```bash
npm run build-storybook
```

### **Deploy to GitHub Pages**
```bash
npm run build-storybook
npx storybook-to-ghpages
```

### **Deploy to Netlify**
```bash
npm run build-storybook
# Deploy dist-storybook folder to Netlify
```

## 🔧 **Best Practices**

### **1. Story Organization**
- Group related stories in folders
- Use descriptive story names
- Include both simple and complex examples

### **2. Documentation**
- Add component descriptions
- Document all props with types
- Include usage examples

### **3. Testing**
- Test all component states
- Include interaction tests
- Use visual regression testing

### **4. Accessibility**
- Test with screen readers
- Include ARIA attributes
- Test keyboard navigation

### **5. Performance**
- Optimize bundle size
- Use lazy loading for large components
- Monitor performance metrics

## 📋 **Story Checklist**

### **For Each Component Story:**
- [ ] Default story with basic props
- [ ] All variant stories
- [ ] All size stories
- [ ] State stories (loading, disabled, etc.)
- [ ] Interactive stories with actions
- [ ] Responsive behavior
- [ ] Dark mode support
- [ ] Accessibility testing
- [ ] Documentation with examples

### **For Design System Stories:**
- [ ] Color palette with all shades
- [ ] Typography scale
- [ ] Spacing system
- [ ] Shadow system
- [ ] Border radius options
- [ ] Component showcase
- [ ] Usage guidelines

## 🎯 **Usage in Other Products**

### **Installation**
```bash
npm install @grc/component-library
```

### **Import Components**
```tsx
import { HybridButton, ThemeToggle, useTheme } from '@grc/component-library'
```

### **Import Styles**
```tsx
import '@grc/component-library/dist/styles.css'
```

### **Usage Example**
```tsx
import React from 'react'
import { HybridButton, ThemeToggle } from '@grc/component-library'

function MyApp() {
  return (
    <div>
      <ThemeToggle />
      <HybridButton variant="primary" size="large">
        Get Started
      </HybridButton>
    </div>
  )
}
```

## 🎉 **Benefits**

### **For Development Teams:**
- **Consistency**: Uniform look across all products
- **Efficiency**: Reuse components instead of rebuilding
- **Quality**: Tested and documented components
- **Collaboration**: Shared design system and patterns

### **For Designers:**
- **Visual Documentation**: See all components in one place
- **Design System**: Comprehensive design token overview
- **Prototyping**: Test components in isolation
- **Handoff**: Clear specifications for developers

### **For Product Teams:**
- **Speed**: Faster development with pre-built components
- **Quality**: Consistent user experience
- **Maintenance**: Centralized component updates
- **Scalability**: Easy to add new products

## 🚀 **Next Steps**

1. **Add More Components**: Expand the component library
2. **Enhance Documentation**: Add more detailed examples
3. **Improve Testing**: Add more interaction and visual tests
4. **Optimize Performance**: Bundle optimization and lazy loading
5. **Deploy**: Set up automated deployment pipeline
6. **Share**: Make the library available to other teams

The Storybook component library provides a solid foundation for building consistent, reusable components that can be shared across multiple products, ensuring a uniform look and feel while improving development efficiency.
