# Shopify Theme Documentation - Glade Theme

## Overview

This is a comprehensive Shopify theme called "Glade" (version 2.0.2) developed by atrey.dev. It's a modern, feature-rich e-commerce theme designed for fitness, activewear, and general retail stores with extensive customization options and advanced functionality.

## Theme Structure

### Core Directories

```
shopify-example-theme/
├── assets/          # CSS, JS, images, and other static files (200+ files)
├── config/          # Theme configuration and settings (2 files)
├── layout/          # Base template files (2 files)
├── locales/         # Translation files for internationalization (22 files)
├── sections/        # Reusable content sections (95+ files)
├── snippets/        # Reusable code components (150+ files)
└── templates/       # Page-specific templates (25+ files)
```

### File Count Summary
- **Total Files**: 518 files
- **Assets**: 200+ CSS/JS/library files
- **Sections**: 95+ section templates
- **Snippets**: 150+ reusable components
- **Templates**: 25+ page templates (JSON + Liquid)
- **Locales**: 22 language files
- **Config**: 2 configuration files

## File Structure Analysis

### 1. Layout Files (`layout/`)

**`theme.liquid`** - Main layout template
- Handles RTL (Right-to-Left) language support
- Loads all CSS/JS assets (200+ files)
- Manages meta tags, fonts, and global scripts
- Includes header and footer sections
- Supports custom fonts and color schemes
- Integrates quick view modal and color swatches
- Handles conditional script loading

**`password.liquid`** - Password protection page layout
- Used when store is password protected
- Minimal layout for password entry
- Includes social media integration

### 2. Configuration (`config/`)

**`settings_schema.json`** - Theme customization settings
- **Theme Info**: Name, version, author details
- **General Settings**: Favicon, currency format, RTL support
- **Layout**: Container widths and spacing
- **Colors**: Color schemes and gradients
- **Typography**: Font selections and sizing
- **Product Cards**: Display options and styling
- **Color Swatches**: Product variant color options
- **Quick View**: Product preview functionality
- **Wishlist & Compare**: Product comparison features
- **Social Media**: Social platform links
- **Cart**: Shopping cart behavior and styling
- **Search**: Predictive search configuration

### 3. Sections (`sections/`)

#### Header Section (`header.liquid`)
- Multiple header layouts (4 different designs)
- Sticky header functionality
- Multi-level navigation menus
- Search functionality (drawer/overlay)
- Cart drawer integration
- Mobile responsive navigation
- RTL language support

#### Product Section (`main-product.liquid`)
- Product image gallery with thumbnails
- Variant selection (color swatches, dropdowns)
- Price display with sale badges
- Inventory tracking and countdown timers
- Buy buttons with quantity selector
- Product descriptions and collapsible tabs
- Related products and recommendations
- Social sharing functionality

#### Footer Section (`footer.liquid`)
- Multi-column layout
- Newsletter signup
- Social media links
- Payment method icons
- Language/currency selectors
- Contact information

#### Other Key Sections
- **Collection pages**: Product filtering and sorting
- **Blog sections**: Article display and navigation
- **Homepage sections**: Slideshows, featured products, testimonials
- **Cart sections**: Shopping cart management

### 4. Templates (`templates/`)

**JSON Template Structure**:
- `index.json` - Homepage layout with multiple sections
- `product.json` - Product page configuration
- `collection.json` - Collection page setup
- `cart.json` - Shopping cart page
- `blog.json` - Blog listing page

### 5. Snippets (`snippets/`)

#### Product Components
- **`product-card.liquid`** - Product grid item display
- **`buy-buttons.liquid`** - Add to cart functionality
- **`price.liquid`** - Price display with sale indicators
- **`product-media.liquid`** - Product image handling

#### UI Components
- **Icon snippets** - SVG icons for various UI elements
- **Form components** - Newsletter, contact forms
- **Navigation components** - Menu structures
- **Social sharing** - Social media integration

### 6. Assets (`assets/`)

#### CSS Files (200+ files)
- **`theme.css`** - Main stylesheet
- **Component-specific CSS** - Modular styling approach (accordion, cart, grid, etc.)
- **RTL support** - `rtl.css` and component RTL variants
- **Section-specific CSS** - Individual section styling
- **Third-party libraries** - Swiper, GLightbox integration

#### JavaScript Files (50+ files)
- **`theme.js`** - Core theme functionality with currency symbols
- **`product-form.js`** - Ajax product form handling
- **`wishlist.js`** - Local storage wishlist management
- **`compare.js`** - Product comparison functionality
- **`cart.js`** - Shopping cart operations
- **Component scripts** - Sliders, modals, search, etc.
- **Third-party libraries** - Swiper.js, GLightbox

### 7. Locales (`locales/`)

**Translation Support**:
- Multiple language files (20+ languages)
- `en.default.json` - Default English translations
- Comprehensive text strings for all UI elements
- Support for regional variations

## Key Features

### 1. Product Management
- **Multiple product card styles** (3 different layouts)
- **Color swatches** for product variants with image/color options
- **Quick view** functionality (drawer/popup modes)
- **Wishlist and compare** features with local storage
- **Inventory tracking** with low stock indicators and progress bars
- **Countdown timers** for sales and promotions
- **Product badges** (sale, new, sold out, preorder)
- **Recently viewed products** with persistent storage
- **Lookbook functionality** with hotspot product placement

### 2. Shopping Experience
- **Ajax cart** with drawer functionality
- **Predictive search** with filters
- **Product filtering** and sorting
- **Free shipping calculator**
- **Coupon code** application
- **Gift wrapping** options

### 3. Design & Layout
- **Responsive design** for all devices
- **RTL language support**
- **Multiple header layouts**
- **Customizable color schemes**
- **Typography controls**
- **Animation effects**

### 4. E-commerce Features
- **Multi-currency support**
- **Payment method icons**
- **Shipping calculator**
- **Newsletter integration**
- **Social media integration**
- **SEO optimization**

### 5. Advanced Functionality
- **Metafield support** for custom data (countdown timers, size guides, etc.)
- **Liquid templating** for dynamic content
- **Section groups** for flexible layouts (header-group, footer-group)
- **Custom liquid sections** and inline styling
- **App integration** support
- **Local storage features** for wishlist, compare, recently viewed
- **Advanced search** with filters and predictive results
- **Tab collage** sections with hover/click behavior
- **Lookbook sliders** with interactive product hotspots
- **Age verification** popup functionality
- **Gift wrapping** and custom messaging options

## Liquid Template Patterns

### 1. Product Display
```liquid
{% render 'product-card',
  product: product,
  show_badges: true,
  show_cart_button: true,
  show_quick_view: true
%}
```

### 2. Price Rendering
```liquid
{% render 'price',
  product: product,
  use_variant: true,
  show_badges: true
%}
```

### 3. Section Configuration
```liquid
{% schema %}
{
  "name": "Section Name",
  "settings": [...],
  "blocks": [...],
  "presets": [...]
}
{% endschema %}
```

## Customization Guidelines

### 1. Theme Settings
- Access via Shopify admin → Online Store → Themes → Customize
- Organized into logical groups (Colors, Typography, Layout, etc.)
- Live preview of changes

### 2. Code Modifications
- Follow Shopify Liquid best practices
- Maintain responsive design principles
- Test across different devices and browsers
- Preserve accessibility features

### 3. Performance Optimization
- Lazy loading for images
- Minified CSS/JS files
- Efficient Liquid code
- Optimized asset loading

## Browser Support
- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers (iOS Safari, Chrome Mobile)
- Progressive enhancement approach

## Development Notes

### 1. File Organization
- Modular CSS approach with component-specific files
- Reusable snippets for common functionality
- Logical separation of concerns

### 2. JavaScript Architecture
- Custom elements for interactive components
- Event-driven functionality
- Ajax-based cart operations

### 3. Accessibility
- ARIA labels and roles
- Keyboard navigation support
- Screen reader compatibility
- Color contrast compliance

## Installation & Setup

1. **Upload theme files** to Shopify admin
2. **Configure theme settings** via customizer
3. **Set up navigation menus**
4. **Configure payment and shipping**
5. **Test all functionality**

## Support & Documentation

- **Theme Author**: atrey.dev
- **Documentation**: https://www.atrey.dev/
- **Support**: https://www.atrey.dev/
- **Version**: 2.0.2

This theme represents a comprehensive e-commerce solution with modern design patterns, extensive customization options, and robust functionality suitable for various retail businesses.