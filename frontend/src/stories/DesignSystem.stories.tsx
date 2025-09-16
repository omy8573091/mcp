import type { Meta, StoryObj } from '@storybook/react'

const meta: Meta = {
  title: 'Design System/Overview',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Complete design system overview including colors, typography, spacing, and components.',
      },
    },
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof meta>

// Color Palette Story
export const ColorPalette: Story = {
  render: () => (
    <div className="p-8 space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Color Palette</h2>
        
        {/* Primary Colors */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Primary Colors</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
            {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950].map((shade) => (
              <div key={shade} className="text-center">
                <div 
                  className={`w-16 h-16 rounded-lg mx-auto mb-2 bg-primary-${shade}`}
                  style={{
                    backgroundColor: `var(--color-primary-${shade})`,
                  }}
                ></div>
                <p className="text-xs text-gray-600 dark:text-gray-400">primary-{shade}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Secondary Colors */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Secondary Colors</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
            {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950].map((shade) => (
              <div key={shade} className="text-center">
                <div 
                  className={`w-16 h-16 rounded-lg mx-auto mb-2 bg-secondary-${shade}`}
                  style={{
                    backgroundColor: `var(--color-secondary-${shade})`,
                  }}
                ></div>
                <p className="text-xs text-gray-600 dark:text-gray-400">secondary-{shade}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Status Colors */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Status Colors</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-3">Success</h4>
              <div className="space-y-2">
                {[100, 500, 900].map((shade) => (
                  <div key={shade} className="flex items-center space-x-3">
                    <div 
                      className={`w-8 h-8 rounded bg-success-${shade}`}
                      style={{
                        backgroundColor: `var(--color-success-${shade})`,
                      }}
                    ></div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">success-{shade}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-3">Warning</h4>
              <div className="space-y-2">
                {[100, 500, 900].map((shade) => (
                  <div key={shade} className="flex items-center space-x-3">
                    <div 
                      className={`w-8 h-8 rounded bg-warning-${shade}`}
                      style={{
                        backgroundColor: `var(--color-warning-${shade})`,
                      }}
                    ></div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">warning-{shade}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-3">Error</h4>
              <div className="space-y-2">
                {[100, 500, 900].map((shade) => (
                  <div key={shade} className="flex items-center space-x-3">
                    <div 
                      className={`w-8 h-8 rounded bg-error-${shade}`}
                      style={{
                        backgroundColor: `var(--color-error-${shade})`,
                      }}
                    ></div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">error-{shade}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  ),
}

// Typography Story
export const Typography: Story = {
  render: () => (
    <div className="p-8 space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Typography</h2>
        
        {/* Font Sizes */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Font Sizes</h3>
          <div className="space-y-4">
            {[
              { size: 'text-xs', label: 'Extra Small (12px)', class: 'text-xs' },
              { size: 'text-sm', label: 'Small (14px)', class: 'text-sm' },
              { size: 'text-base', label: 'Base (16px)', class: 'text-base' },
              { size: 'text-lg', label: 'Large (18px)', class: 'text-lg' },
              { size: 'text-xl', label: 'Extra Large (20px)', class: 'text-xl' },
              { size: 'text-2xl', label: '2X Large (24px)', class: 'text-2xl' },
              { size: 'text-3xl', label: '3X Large (30px)', class: 'text-3xl' },
              { size: 'text-4xl', label: '4X Large (36px)', class: 'text-4xl' },
            ].map((item) => (
              <div key={item.size} className="flex items-center space-x-4">
                <div className="w-20 text-sm text-gray-500 dark:text-gray-400">{item.size}</div>
                <div className={`${item.class} text-gray-900 dark:text-gray-100`}>
                  {item.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Font Weights */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Font Weights</h3>
          <div className="space-y-4">
            {[
              { weight: 'font-thin', label: 'Thin (100)' },
              { weight: 'font-light', label: 'Light (300)' },
              { weight: 'font-normal', label: 'Normal (400)' },
              { weight: 'font-medium', label: 'Medium (500)' },
              { weight: 'font-semibold', label: 'Semibold (600)' },
              { weight: 'font-bold', label: 'Bold (700)' },
              { weight: 'font-extrabold', label: 'Extra Bold (800)' },
              { weight: 'font-black', label: 'Black (900)' },
            ].map((item) => (
              <div key={item.weight} className="flex items-center space-x-4">
                <div className="w-24 text-sm text-gray-500 dark:text-gray-400">{item.weight}</div>
                <div className={`text-lg ${item.weight} text-gray-900 dark:text-gray-100`}>
                  {item.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Text Styles */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Text Styles</h3>
          <div className="space-y-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">Heading 1</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">text-4xl font-bold</p>
            </div>
            <div>
              <h2 className="text-3xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Heading 2</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">text-3xl font-semibold</p>
            </div>
            <div>
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Heading 3</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">text-2xl font-semibold</p>
            </div>
            <div>
              <h4 className="text-xl font-medium text-gray-900 dark:text-gray-100 mb-2">Heading 4</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">text-xl font-medium</p>
            </div>
            <div>
              <h5 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Heading 5</h5>
              <p className="text-sm text-gray-500 dark:text-gray-400">text-lg font-medium</p>
            </div>
            <div>
              <h6 className="text-base font-medium text-gray-900 dark:text-gray-100 mb-2">Heading 6</h6>
              <p className="text-sm text-gray-500 dark:text-gray-400">text-base font-medium</p>
            </div>
            <div>
              <p className="text-base text-gray-700 dark:text-gray-300 mb-2">
                Body text - Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">text-base</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Small text - Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">text-sm</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  ),
}

// Spacing Story
export const Spacing: Story = {
  render: () => (
    <div className="p-8 space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Spacing Scale</h2>
        
        <div className="space-y-4">
          {[
            { size: '0', value: '0px', class: 'w-0' },
            { size: '1', value: '4px', class: 'w-1' },
            { size: '2', value: '8px', class: 'w-2' },
            { size: '3', value: '12px', class: 'w-3' },
            { size: '4', value: '16px', class: 'w-4' },
            { size: '5', value: '20px', class: 'w-5' },
            { size: '6', value: '24px', class: 'w-6' },
            { size: '8', value: '32px', class: 'w-8' },
            { size: '10', value: '40px', class: 'w-10' },
            { size: '12', value: '48px', class: 'w-12' },
            { size: '16', value: '64px', class: 'w-16' },
            { size: '20', value: '80px', class: 'w-20' },
            { size: '24', value: '96px', class: 'w-24' },
            { size: '32', value: '128px', class: 'w-32' },
          ].map((item) => (
            <div key={item.size} className="flex items-center space-x-4">
              <div className="w-16 text-sm text-gray-500 dark:text-gray-400">{item.size}</div>
              <div className="w-20 text-sm text-gray-500 dark:text-gray-400">{item.value}</div>
              <div className={`${item.class} h-4 bg-blue-500 rounded`}></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  ),
}

// Shadows Story
export const Shadows: Story = {
  render: () => (
    <div className="p-8 space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Shadow System</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            { name: 'Small', class: 'shadow-sm', description: 'Subtle shadow for subtle elevation' },
            { name: 'Base', class: 'shadow', description: 'Default shadow for cards and components' },
            { name: 'Medium', class: 'shadow-md', description: 'Medium shadow for elevated elements' },
            { name: 'Large', class: 'shadow-lg', description: 'Large shadow for prominent elements' },
            { name: 'Extra Large', class: 'shadow-xl', description: 'Extra large shadow for modals' },
            { name: '2X Large', class: 'shadow-2xl', description: 'Maximum shadow for overlays' },
          ].map((shadow) => (
            <div key={shadow.name} className="text-center">
              <div className={`w-24 h-24 bg-white dark:bg-gray-800 rounded-lg mx-auto mb-4 ${shadow.class}`}></div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">{shadow.name}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{shadow.class}</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">{shadow.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  ),
}

// Border Radius Story
export const BorderRadius: Story = {
  render: () => (
    <div className="p-8 space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Border Radius</h2>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-8">
          {[
            { name: 'None', class: 'rounded-none', value: '0px' },
            { name: 'Small', class: 'rounded-sm', value: '2px' },
            { name: 'Base', class: 'rounded', value: '4px' },
            { name: 'Medium', class: 'rounded-md', value: '6px' },
            { name: 'Large', class: 'rounded-lg', value: '8px' },
            { name: 'Extra Large', class: 'rounded-xl', value: '12px' },
            { name: '2X Large', class: 'rounded-2xl', value: '16px' },
            { name: '3X Large', class: 'rounded-3xl', value: '24px' },
            { name: 'Full', class: 'rounded-full', value: '9999px' },
          ].map((radius) => (
            <div key={radius.name} className="text-center">
              <div className={`w-16 h-16 bg-blue-500 mx-auto mb-3 ${radius.class}`}></div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">{radius.name}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{radius.class}</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">{radius.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  ),
}

// Component Showcase Story
export const ComponentShowcase: Story = {
  render: () => (
    <div className="p-8 space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Component Showcase</h2>
        
        {/* Buttons */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Buttons</h3>
          <div className="flex flex-wrap gap-4">
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              Primary
            </button>
            <button className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors">
              Secondary
            </button>
            <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">
              Outline
            </button>
            <button className="text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors">
              Ghost
            </button>
            <button className="text-blue-600 underline hover:text-blue-700 transition-colors">
              Link
            </button>
          </div>
        </div>

        {/* Cards */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Cards</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
              <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Default Card</h4>
              <p className="text-gray-600 dark:text-gray-400">Basic card with default styling</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Elevated Card</h4>
              <p className="text-gray-600 dark:text-gray-400">Card with enhanced shadow</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg border-2 border-gray-300 dark:border-gray-600 p-6">
              <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Outlined Card</h4>
              <p className="text-gray-600 dark:text-gray-400">Card with prominent border</p>
            </div>
          </div>
        </div>

        {/* Form Elements */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Form Elements</h3>
          <div className="max-w-md space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Input Field
              </label>
              <input 
                type="text" 
                placeholder="Enter text..." 
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Select
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option>Option 1</option>
                <option>Option 2</option>
                <option>Option 3</option>
              </select>
            </div>
            <div>
              <label className="flex items-center">
                <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Checkbox option</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  ),
}
