# REDMIA Design System - Master

## Brand Identity

### Logo
- **Primary**: `assets/img/logo-mark.svg`
- **Favicon**: `assets/img/favicon.svg`
- **Color Palette**: Azul oscuro (#0F2A44), Dorado (#C8924A), Crema (#FBF8F3)

### Color Tokens

```css
/* Primitive */
--color-blue-900: #0F2A44;
--color-blue-700: #2A4768;
--color-gold-500: #C8924A;
--color-cream-50: #FBF8F3;

/* Semantic */
--color-primary: var(--color-blue-900);
--color-primary-light: var(--color-blue-700);
--color-accent: var(--color-gold-500);
--color-background: var(--color-cream-50);
--color-surface: #FFFFFF;
--color-text-primary: #1A1A1A;
--color-text-secondary: #6B7280;
--color-text-muted: #9CA3AF;
```

### Typography

```css
--font-heading: 'Playfair Display', serif;
--font-body: 'Inter', sans-serif;
--font-mono: 'JetBrains Mono', monospace;

--text-xs: 0.75rem;
--text-sm: 0.875rem;
--text-base: 1rem;
--text-lg: 1.125rem;
--text-xl: 1.25rem;
--text-2xl: 1.5rem;
--text-3xl: 1.875rem;
--text-4xl: 2.25rem;
--text-5xl: 3rem;
```

### Spacing Scale

```css
--space-1: 0.25rem;
--space-2: 0.5rem;
--space-3: 0.75rem;
--space-4: 1rem;
--space-5: 1.25rem;
--space-6: 1.5rem;
--space-8: 2rem;
--space-10: 2.5rem;
--space-12: 3rem;
--space-16: 4rem;
--space-20: 5rem;
--space-24: 6rem;
```

### Shadows

```css
--shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
--shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
--shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
--shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
```

### Border Radius

```css
--radius-sm: 0.25rem;
--radius-md: 0.375rem;
--radius-lg: 0.5rem;
--radius-xl: 0.75rem;
--radius-2xl: 1rem;
--radius-full: 9999px;
```

## Anti-Patterns to Avoid

- No usar emojis como iconos estructurales
- No usar colores hardcodeados por pantalla
- No usar transformaciones que cambien el layout en estados press
- Mantener contraste >= 4.5:1 para texto primario
- Respetar áreas seguras en headers y footers fijos
