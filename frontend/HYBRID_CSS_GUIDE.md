# Hybrid CSS Architecture Guide

## Overview

This guide covers the hybrid CSS architecture that combines **Tailwind CSS** for utility classes and rapid prototyping with **traditional CSS/SCSS** for complex component-specific styles. This approach provides the best of both worlds: the speed and consistency of Tailwind with the power and flexibility of custom CSS.

## 🎯 **Architecture Principles**

### **When to Use Tailwind CSS**
- **Utility Classes**: Spacing, colors, typography, layout
- **Responsive Design**: Breakpoints and responsive utilities
- **Rapid Prototyping**: Quick styling and layout adjustments
- **Consistent Design System**: Standardized spacing, colors, and typography
- **Performance**: Optimized bundle size with purging

### **When to Use Traditional CSS/SCSS**
- **Complex Components**: Multi-state components with intricate styling
- **Animations**: Complex keyframe animations and transitions
- **CSS Modules**: Component-scoped styles to prevent conflicts
- **Advanced Features**: SCSS mixins, functions, and variables
- **Legacy Integration**: Existing CSS frameworks or libraries

## 🏗️ **File Structure**

```
frontend/
├── src/
│   ├── styles/
│   │   ├── globals.css              # Tailwind CSS base styles
│   │   ├── variables.scss           # SCSS variables and mixins
│   │   ├── components.scss          # Global component styles
│   │   └── modules/                 # CSS Modules
│   │       ├── Button.module.scss
│   │       ├── Card.module.scss
│   │       └── ...
│   ├── app/
│   │   └── components/              # React components
│   │       ├── HybridButton.tsx     # Example hybrid component
│   │       └── ...
│   └── lib/
│       └── utils.ts                 # Utility functions
├── tailwind.config.js               # Tailwind configuration
├── postcss.config.js                # PostCSS configuration
└── next.config.js                   # Next.js configuration
```

## 🎨 **Styling Layers**

### **Layer 1: Tailwind CSS (Base)**
```css
/* globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Custom Tailwind components */
@layer components {
  .btn {
    @apply inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200;
  }
}
```

### **Layer 2: SCSS Variables & Mixins**
```scss
// variables.scss
$primary-500: #3b82f6;
$spacing-4: 1rem;

@mixin button-base {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  // ... complex styling
}
```

### **Layer 3: CSS Modules (Component-Specific)**
```scss
// Button.module.scss
@import '../variables';

.button {
  @include button-base;
  
  &.primary {
    background-color: $primary-500;
    // ... complex component logic
  }
}
```

### **Layer 4: Component Integration**
```tsx
// HybridButton.tsx
import styles from './Button.module.scss'
import { cn } from '../lib/utils'

export function HybridButton({ className, ...props }) {
  return (
    <button
      className={cn(
        styles.button,           // CSS Module
        'focus:ring-2',         // Tailwind utility
        className               // Custom classes
      )}
      {...props}
    />
  )
}
```

## 🧩 **Component Examples**

### **Simple Component (Tailwind Only)**
```tsx
// SimpleCard.tsx - Uses only Tailwind
export function SimpleCard({ children }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft border border-gray-200 dark:border-gray-700 p-6">
      {children}
    </div>
  )
}
```

### **Complex Component (Hybrid Approach)**
```tsx
// ComplexCard.tsx - Uses both Tailwind and CSS Modules
import styles from './Card.module.scss'
import { cn } from '../lib/utils'

export function ComplexCard({ 
  variant = 'default', 
  interactive = false, 
  className,
  children 
}) {
  return (
    <div
      className={cn(
        styles.card,                    // CSS Module base
        styles[variant],               // CSS Module variant
        {
          [styles.interactive]: interactive, // CSS Module state
        },
        'transition-all duration-200', // Tailwind utilities
        'hover:shadow-lg',             // Tailwind hover state
        className                      // Custom classes
      )}
    >
      {children}
    </div>
  )
}
```

### **Layout Component (Tailwind + SCSS)**
```tsx
// Layout.tsx - Uses Tailwind for layout, SCSS for complex styling
import styles from './Layout.module.scss'

export function Layout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Header content */}
          </div>
        </div>
      </header>
      
      <main className={styles.mainContent}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </div>
      </main>
    </div>
  )
}
```

## 🎨 **Design System Integration**

### **Color System**
```scss
// variables.scss - SCSS variables
$primary-50: #eff6ff;
$primary-500: #3b82f6;
$primary-900: #1e3a8a;

// tailwind.config.js - Tailwind colors
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          900: '#1e3a8a',
        }
      }
    }
  }
}
```

### **Typography System**
```scss
// variables.scss
$font-family-sans: 'Inter', ui-sans-serif, system-ui;
$font-size-base: 1rem;
$line-height-normal: 1.5;

// Usage in components
.text-heading {
  font-family: $font-family-sans;
  font-size: $font-size-2xl;
  line-height: $line-height-tight;
}
```

### **Spacing System**
```scss
// variables.scss
$spacing-4: 1rem;
$spacing-6: 1.5rem;
$spacing-8: 2rem;

// Mixins for consistent spacing
@mixin padding-base {
  padding: $spacing-4 $spacing-6;
}

@mixin margin-section {
  margin: $spacing-8 0;
}
```

## 📱 **Responsive Design**

### **Tailwind Breakpoints**
```tsx
// Responsive component using Tailwind
export function ResponsiveGrid({ children }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
      {children}
    </div>
  )
}
```

### **SCSS Responsive Mixins**
```scss
// variables.scss
@mixin responsive($breakpoint) {
  @if $breakpoint == sm {
    @media (min-width: 640px) { @content; }
  }
  @if $breakpoint == lg {
    @media (min-width: 1024px) { @content; }
  }
}

// Usage in CSS Modules
.card {
  padding: $spacing-4;
  
  @include responsive(lg) {
    padding: $spacing-6;
  }
}
```

## 🌙 **Dark Mode Support**

### **Tailwind Dark Mode**
```tsx
// Component with Tailwind dark mode
export function ThemedCard({ children }) {
  return (
    <div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-700">
      {children}
    </div>
  )
}
```

### **SCSS Dark Mode**
```scss
// variables.scss
@mixin dark-mode {
  @media (prefers-color-scheme: dark) {
    @content;
  }
  
  .dark & {
    @content;
  }
}

// Usage in CSS Modules
.card {
  background-color: white;
  color: $secondary-900;
  
  @include dark-mode {
    background-color: $secondary-800;
    color: $secondary-100;
  }
}
```

## 🎭 **Animations**

### **Tailwind Animations**
```tsx
// Simple animations with Tailwind
export function AnimatedCard({ children }) {
  return (
    <div className="transform transition-all duration-300 hover:scale-105 hover:shadow-lg">
      {children}
    </div>
  )
}
```

### **SCSS Animations**
```scss
// variables.scss
@keyframes slideIn {
  from { 
    transform: translateY(-10px); 
    opacity: 0; 
  }
  to { 
    transform: translateY(0); 
    opacity: 1; 
  }
}

// Usage in CSS Modules
.modal {
  animation: slideIn 0.3s ease-out;
}
```

## 🛠️ **Development Workflow**

### **1. Start with Tailwind**
```tsx
// Quick prototyping with Tailwind
export function QuickCard({ children }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      {children}
    </div>
  )
}
```

### **2. Extract to CSS Modules**
```scss
// Card.module.scss - When component becomes complex
.card {
  @include card-base;
  
  &--elevated {
    box-shadow: $shadow-medium;
  }
  
  &--interactive {
    cursor: pointer;
    transition: all $transition-duration-200;
    
    &:hover {
      transform: translateY(-2px);
    }
  }
}
```

### **3. Hybrid Integration**
```tsx
// HybridCard.tsx - Best of both worlds
import styles from './Card.module.scss'
import { cn } from '../lib/utils'

export function HybridCard({ 
  variant = 'default', 
  interactive = false,
  className,
  children 
}) {
  return (
    <div
      className={cn(
        styles.card,                    // CSS Module base
        styles[variant],               // CSS Module variant
        {
          [styles.interactive]: interactive, // CSS Module state
        },
        'transition-all duration-200', // Tailwind utilities
        className                      // Custom classes
      )}
    >
      {children}
    </div>
  )
}
```

## 📊 **Performance Considerations**

### **Bundle Optimization**
```javascript
// next.config.js
module.exports = {
  // Tailwind CSS purging
  experimental: {
    optimizeCss: true,
  },
  
  // SCSS optimization
  sassOptions: {
    includePaths: ['./src/styles'],
    prependData: `@import "variables.scss";`,
  },
  
  // Bundle splitting
  webpack: (config) => {
    config.optimization.splitChunks = {
      chunks: 'all',
      cacheGroups: {
        styles: {
          test: /\.(css|scss)$/,
          name: 'styles',
          chunks: 'all',
        },
      },
    };
    return config;
  },
}
```

### **CSS Loading Strategy**
```tsx
// Dynamic CSS loading
import dynamic from 'next/dynamic'

const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <div className="animate-pulse bg-gray-200 h-32 rounded" />,
  ssr: false
})
```

## 🧪 **Testing Strategy**

### **Component Testing**
```tsx
// Button.test.tsx
import { render, screen } from '@testing-library/react'
import { HybridButton } from './HybridButton'

test('renders button with correct classes', () => {
  render(<HybridButton variant="primary">Click me</HybridButton>)
  const button = screen.getByRole('button')
  
  // Test CSS Module classes
  expect(button).toHaveClass('button', 'primary')
  
  // Test Tailwind classes
  expect(button).toHaveClass('focus:ring-2')
})
```

### **Visual Testing**
```tsx
// Visual regression testing
test('button variants match design', () => {
  render(
    <div>
      <HybridButton variant="primary">Primary</HybridButton>
      <HybridButton variant="secondary">Secondary</HybridButton>
      <HybridButton variant="outline">Outline</HybridButton>
    </div>
  )
  
  // Take screenshot and compare
})
```

## 🚀 **Best Practices**

### **1. Naming Conventions**
```scss
// CSS Modules - BEM-like naming
.button {
  &--primary { }
  &--secondary { }
  &__icon { }
  &__text { }
}

// Tailwind - Utility classes
className="bg-primary-500 text-white px-4 py-2 rounded-lg"
```

### **2. Component Organization**
```tsx
// Component structure
export function HybridComponent({ 
  // Props
  variant = 'default',
  size = 'medium',
  className,
  children,
  ...props 
}) {
  // Hooks and state
  
  // Event handlers
  
  // Render
  return (
    <div
      className={cn(
        styles.base,           // CSS Module base
        styles[variant],      // CSS Module variant
        styles[size],         // CSS Module size
        'transition-all',     // Tailwind utilities
        className            // Custom classes
      )}
      {...props}
    >
      {children}
    </div>
  )
}
```

### **3. Style Organization**
```scss
// CSS Module organization
.component {
  // Base styles
  @include base-styles;
  
  // Variants
  &--variant1 { }
  &--variant2 { }
  
  // States
  &--active { }
  &--disabled { }
  
  // Elements
  &__element { }
  
  // Modifiers
  &--modifier { }
  
  // Responsive
  @include responsive(lg) { }
  
  // Dark mode
  @include dark-mode { }
}
```

## 📚 **Migration Guide**

### **From Pure Tailwind to Hybrid**
1. **Identify Complex Components**: Look for components with many Tailwind classes
2. **Extract to CSS Modules**: Move complex styling to SCSS files
3. **Keep Utilities**: Use Tailwind for spacing, colors, and layout
4. **Test Thoroughly**: Ensure visual consistency after migration

### **From Pure CSS to Hybrid**
1. **Audit Existing Styles**: Identify reusable patterns
2. **Create Design System**: Define variables and mixins
3. **Migrate to Tailwind**: Replace common patterns with utilities
4. **Keep Complex Logic**: Maintain SCSS for advanced features

## 🎯 **Decision Matrix**

| Use Case | Tailwind CSS | SCSS/CSS Modules | Hybrid |
|----------|-------------|------------------|---------|
| Simple layouts | ✅ | ❌ | ✅ |
| Complex animations | ❌ | ✅ | ✅ |
| Rapid prototyping | ✅ | ❌ | ✅ |
| Component libraries | ❌ | ✅ | ✅ |
| Responsive design | ✅ | ✅ | ✅ |
| Dark mode | ✅ | ✅ | ✅ |
| Performance critical | ✅ | ❌ | ✅ |
| Team consistency | ✅ | ❌ | ✅ |

## 🚀 **Getting Started**

### **1. Install Dependencies**
```bash
npm install -D tailwindcss postcss autoprefixer sass
npm install clsx tailwind-merge
```

### **2. Configure Tailwind**
```javascript
// tailwind.config.js
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      // Custom theme extensions
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}
```

### **3. Set up SCSS**
```scss
// src/styles/variables.scss
$primary-500: #3b82f6;
$spacing-4: 1rem;

@mixin button-base {
  // Base button styles
}
```

### **4. Create Hybrid Component**
```tsx
// src/components/HybridButton.tsx
import styles from '../styles/modules/Button.module.scss'
import { cn } from '../lib/utils'

export function HybridButton({ className, ...props }) {
  return (
    <button
      className={cn(
        styles.button,
        'focus:ring-2 focus:ring-primary-500',
        className
      )}
      {...props}
    />
  )
}
```

## 🎉 **Conclusion**

The hybrid CSS architecture provides:

- **Flexibility**: Use the right tool for each job
- **Performance**: Optimized bundle sizes and loading
- **Maintainability**: Clear separation of concerns
- **Scalability**: Easy to extend and modify
- **Developer Experience**: Best practices from both worlds

This approach allows teams to leverage the speed of Tailwind CSS for common patterns while maintaining the power and flexibility of custom CSS for complex components and unique design requirements.
