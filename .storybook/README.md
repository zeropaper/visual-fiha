# Visual Fiha Storybook

This Storybook instance documents and showcases the Visual Fiha component library. It provides an interactive environment for developing, testing, and documenting UI components.

## 🚀 Getting Started

### Running Storybook

```bash
# Start Storybook development server
pnpm run storybook

# Build Storybook for production
pnpm run build-storybook
```

Storybook will be available at `http://localhost:6006`

### Project Structure

```
.storybook/
├── main.ts          # Storybook configuration
├── preview.ts       # Global parameters and decorators
└── vitest.setup.ts  # Vitest integration setup

src/
├── **/*.stories.tsx # Component stories
├── ui/              # Basic UI components
├── controls/        # Feature components
└── *.stories.tsx    # Documentation stories
```

## 📚 Available Stories

### 🧩 UI Components
- **Button** - Primary action buttons with variants
- **Input** - Form input controls with validation
- **Select** - Dropdown selection components
- **SidebarTabs** - Navigation tab interface

### 📖 Documentation
- **Welcome** - Introduction to Visual Fiha
- **Architecture** - System design and messaging
- **Design System** - Colors, typography, and guidelines
- **Component Showcase** - Interactive examples

### 🎨 Features
- **Accessibility Testing** - Automated a11y validation
- **Visual Testing** - Component visual regression
- **Interaction Testing** - User behavior simulation
- **Responsive Design** - Multi-device layout testing

## 🛠️ Development

### Adding New Stories

1. Create a `.stories.tsx` file next to your component:

```typescript
import type { Meta, StoryObj } from '@storybook/react';
import { YourComponent } from './YourComponent';

const meta: Meta<typeof YourComponent> = {
  title: 'UI/YourComponent',
  component: YourComponent,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    // Your component props
  },
};
```

2. Add variations for different states:

```typescript
export const Disabled: Story = {
  args: {
    disabled: true,
  },
};

export const WithIcon: Story = {
  args: {
    icon: '🎮',
    children: 'Play',
  },
};
```

### Story Organization

Stories are organized in a hierarchical structure:

- `UI/` - Basic reusable components
- `Features/` - Complex application-specific components
- `Examples/` - Combined component demonstrations
- `Documentation/` - Project information and guidelines

### Configuration

The Storybook configuration includes:

- **Vite Integration** - Fast builds with HMR
- **TypeScript Path Aliases** - Import resolution matching the main app
- **CSS Modules** - Styled component support
- **Accessibility Testing** - Automated a11y validation
- **Visual Testing** - Component screenshot comparison
- **Vitest Integration** - Unit testing for stories

## 🧪 Testing

### Accessibility Testing

All stories automatically run accessibility tests using `@storybook/addon-a11y`. 

To view a11y results:
1. Open any story
2. Check the "Accessibility" tab in the addons panel
3. Fix any reported violations

### Visual Testing

Stories can be used for visual regression testing:

```bash
# Run visual tests (when configured with Chromatic)
npx chromatic --project-token=<your-token>
```

### Unit Testing

Test stories directly with Vitest:

```bash
# Run story tests
npx vitest --project=storybook
```

## 🎯 Best Practices

### Component Stories

1. **Start with Default** - Always include a basic "Default" story
2. **Cover Edge Cases** - Test empty states, loading states, errors
3. **Show Variations** - Different props, sizes, themes
4. **Document Props** - Use Storybook's automatic prop documentation

### Accessibility

1. **Test with a11y Addon** - Ensure all stories pass accessibility checks
2. **Include Focus States** - Test keyboard navigation
3. **Color Contrast** - Verify text readability
4. **Screen Reader** - Test with assistive technology

### Performance

1. **Optimize Assets** - Use appropriate image sizes
2. **Lazy Loading** - Load heavy components on demand
3. **Bundle Analysis** - Monitor story bundle sizes
4. **Mocking** - Mock external dependencies

## 🔧 Configuration Files

### `.storybook/main.ts`

Main Storybook configuration:
- Story file patterns
- Addon registration
- Vite configuration
- TypeScript path resolution

### `.storybook/preview.ts`

Global story parameters:
- Default backgrounds
- Control matchers
- Accessibility settings
- CSS imports

### `.storybook/vitest.setup.ts`

Vitest integration for testing stories as unit tests.

## 🚀 Deployment

### Build for Production

```bash
pnpm run build-storybook
```

The built Storybook will be in `storybook-static/` directory.

### Hosting Options

- **Netlify** - Drag and drop `storybook-static` folder
- **Vercel** - Connect Git repository with build command
- **GitHub Pages** - Use `storybook-static` as publish directory
- **Chromatic** - Automated visual testing and hosting

## 📝 Contributing

When adding new components:

1. Create component stories alongside the component
2. Include accessibility testing
3. Document props and usage patterns
4. Add examples for common use cases
5. Test across different themes and screen sizes

## 🔗 Resources

- [Storybook Documentation](https://storybook.js.org/docs)
- [Visual Fiha Repository](https://github.com/zeropaper/visual-fiha)
- [Accessibility Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Component Testing](https://storybook.js.org/docs/writing-tests)
