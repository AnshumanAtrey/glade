# Shopify Liquid Code Structure Guide

## Overview

This guide explains how Liquid code is structured and written in Shopify themes, using the Glade theme as a comprehensive example. Liquid is Shopify's templating language that allows dynamic content generation.

## Liquid Fundamentals

### 1. Liquid Syntax Types

#### Objects (Output)
```liquid
{{ product.title }}
{{ product.price | money }}
{{ 'hello_world' | t }}
```

#### Tags (Logic)
```liquid
{% if product.available %}
  <button>Add to Cart</button>
{% endif %}

{% for product in collection.products %}
  <div>{{ product.title }}</div>
{% endfor %}
```

#### Filters (Modify Output)
```liquid
{{ product.price | money }}
{{ product.title | upcase }}
{{ article.created_at | date: '%B %d, %Y' }}
```

## File Structure Patterns

### 1. Layout Files (`layout/`)

#### Main Layout (`theme.liquid`)
```liquid
<!doctype html>
<html lang="{{ request.locale.iso_code }}">
<head>
  <!-- Meta tags and assets -->
  {{ content_for_header }}
</head>
<body>
  {%- sections 'header-group' -%}
  
  <main id="MainContent">
    {{ content_for_layout }}
  </main>
  
  {% sections 'footer-group' %}
</body>
</html>
```

**Key Patterns:**
- `{{ content_for_header }}` - Shopify-generated head content
- `{{ content_for_layout }}` - Page-specific content
- `{%- sections 'group-name' -%}` - Section groups

### 2. Template Files (`templates/`)

#### Product Template (`product.json`)
```json
{
  "sections": {
    "main": {
      "type": "main-product",
      "blocks": [
        {
          "type": "title",
          "settings": {}
        },
        {
          "type": "price",
          "settings": {
            "show_badges": true
          }
        }
      ]
    }
  },
  "order": ["main"]
}
```

**Key Concepts:**
- JSON templates define section layout
- Blocks are reusable components within sections
- Settings control block behavior

### 3. Section Files (`sections/`)

#### Product Section Structure
```liquid
{%- liquid
  assign current_variant = product.selected_or_first_available_variant
  assign on_sale = false
  if current_variant.compare_at_price != null
    assign on_sale = true
  endif
-%}

<div class="product" data-section-id="{{ section.id }}">
  {%- for block in section.blocks -%}
    {%- case block.type -%}
      {%- when 'title' -%}
        <h1 {{ block.shopify_attributes }}>
          {{ product.title }}
        </h1>
      
      {%- when 'price' -%}
        <div {{ block.shopify_attributes }}>
          {%- render 'price', product: product -%}
        </div>
        
      {%- when 'buy_buttons' -%}
        {%- render 'buy-buttons', 
            product: product,
            section_id: section.id
        -%}
    {%- endcase -%}
  {%- endfor -%}
</div>

{% schema %}
{
  "name": "Product",
  "blocks": [
    {
      "type": "title",
      "name": "Product Title"
    },
    {
      "type": "price",
      "name": "Price",
      "settings": [
        {
          "type": "checkbox",
          "id": "show_badges",
          "label": "Show sale badges",
          "default": true
        }
      ]
    }
  ]
}
{% endschema %}
```

**Key Patterns:**
- `{%- liquid -%}` - Liquid tag for multiple assignments
- `{%- for block in section.blocks -%}` - Loop through blocks
- `{%- case block.type -%}` - Switch statement for block types
- `{{ block.shopify_attributes }}` - Required for block functionality
- `{% schema %}` - JSON configuration for section

### 4. Snippet Files (`snippets/`)

#### Product Card Snippet
```liquid
{%- comment -%}
  Renders a product card
  
  Accepts:
  - product: {Object} Product object
  - show_badges: {Boolean} Show sale badges
  - show_cart_button: {Boolean} Show add to cart
  
  Usage:
  {% render 'product-card', 
      product: product,
      show_badges: true 
  %}
{%- endcomment -%}

{%- liquid
  assign variant = product.selected_or_first_available_variant
  assign on_sale = false
  
  if variant.compare_at_price > variant.price
    assign on_sale = true
  endif
-%}

<div class="product-card">
  {%- if product.featured_media -%}
    <a href="{{ product.url }}">
      <img 
        src="{{ product.featured_media | image_url: width: 300 }}"
        alt="{{ product.featured_media.alt | escape }}"
        loading="lazy"
      >
    </a>
  {%- endif -%}
  
  <h3>
    <a href="{{ product.url }}">{{ product.title }}</a>
  </h3>
  
  {%- render 'price', product: product -%}
  
  {%- if show_cart_button -%}
    {%- render 'add-to-cart-form', product: product -%}
  {%- endif -%}
</div>
```

#### Price Display Snippet
```liquid
{%- liquid
  if use_variant
    assign target = product.selected_or_first_available_variant
  else
    assign target = product
  endif
  
  assign compare_at_price = target.compare_at_price
  assign price = target.price
  assign money_price = price | money
-%}

<div class="price">
  {%- if compare_at_price > price -%}
    <s class="price-compare">
      {{ compare_at_price | money }}
    </s>
  {%- endif -%}
  
  <span class="price-current">
    {{ money_price }}
  </span>
  
  {%- if show_badges and compare_at_price > price -%}
    <span class="badge-sale">Sale</span>
  {%- endif -%}
</div>
```

## Advanced Liquid Patterns

### 1. Conditional Logic
```liquid
{%- liquid
  # Multiple conditions
  if product.available and product.price > 0
    assign show_cart = true
  else
    assign show_cart = false
  endif
  
  # Unless (opposite of if)
  unless product.tags contains 'hidden'
    echo product.title
  endunless
  
  # Case statements
  case product.type
    when 'Clothing'
      assign icon = 'shirt'
    when 'Accessories'
      assign icon = 'bag'
    else
      assign icon = 'product'
  endcase
-%}
```

### 2. Loops and Iteration
```liquid
{%- liquid
  # Basic loop
  for product in collection.products
    render 'product-card', product: product
  endfor
  
  # Loop with limit
  for product in collection.products limit: 8
    render 'product-card', product: product
  endfor
  
  # Loop with offset
  for product in collection.products offset: 4 limit: 4
    render 'product-card', product: product
  endfor
  
  # Loop variables
  for product in collection.products
    if forloop.first
      echo '<div class="first-product">'
    endif
    
    render 'product-card', product: product
    
    if forloop.last
      echo '</div>'
    endif
  endfor
-%}
```

### 3. Variable Assignment
```liquid
{%- liquid
  # Simple assignment
  assign product_count = collection.products.size
  
  # Calculations
  assign discount = product.compare_at_price | minus: product.price
  assign discount_percent = discount | times: 100 | divided_by: product.compare_at_price
  
  # String manipulation
  assign product_handle = product.title | handleize
  assign short_description = product.description | truncatewords: 20
  
  # Array operations
  assign product_tags = product.tags | join: ', '
  assign sorted_products = collection.products | sort: 'price'
-%}
```

### 4. Metafields Usage
```liquid
{%- liquid
  # Product metafields
  assign short_description = product.metafields.custom.short_description.value
  assign size_guide = product.metafields.custom.size_guide.value
  assign countdown_timer = product.metafields.custom.countdown_timer.value
  
  # Check if metafield exists
  if product.metafields.custom.featured_badge.value != blank
    assign featured_badge = product.metafields.custom.featured_badge.value
  endif
-%}

{%- if short_description != blank -%}
  <div class="product-excerpt">
    {{ short_description }}
  </div>
{%- endif -%}
```

### 5. Form Handling
```liquid
{%- form 'product', product, id: 'product-form' -%}
  <input type="hidden" name="id" value="{{ product.selected_or_first_available_variant.id }}">
  
  {%- unless product.has_only_default_variant -%}
    {%- for option in product.options_with_values -%}
      <div class="product-option">
        <label>{{ option.name }}:</label>
        <select name="options[{{ option.name | escape }}]">
          {%- for value in option.values -%}
            <option value="{{ value | escape }}"
              {%- if option.selected_value == value -%} selected{%- endif -%}>
              {{ value }}
            </option>
          {%- endfor -%}
        </select>
      </div>
    {%- endfor -%}
  {%- endunless -%}
  
  <button type="submit" name="add">
    Add to Cart
  </button>
{%- endform -%}
```

## Theme-Specific Patterns

### 1. RTL Language Support
```liquid
{%- liquid
  assign theme_rtl = false
  if settings.enable_rtl and settings.langauges_rtl == blank
    assign theme_rtl = true
  endif
  
  if settings.enable_rtl and settings.langauges_rtl != blank
    assign rtl_languages = settings.langauges_rtl | split: ','
    for language in rtl_languages
      if language == request.locale.iso_code
        assign theme_rtl = true
      endif
    endfor
  endif
-%}

<html {% if theme_rtl %}dir="rtl"{% endif %}>
```

### 2. Color Scheme Management
```liquid
{%- liquid
  assign color_scheme = section.settings.color_scheme | default: 'background-1'
-%}

<div class="section color-{{ color_scheme }}">
  <!-- Section content -->
</div>
```

### 3. Responsive Image Handling
```liquid
{%- liquid
  assign image_sizes = '(min-width: 1200px) 550px, (min-width: 750px) 550px, 100vw'
-%}

<img
  srcset="
    {%- if product.featured_media.width >= 275 -%}{{ product.featured_media | image_url: width: 275 }} 275w,{%- endif -%}
    {%- if product.featured_media.width >= 550 -%}{{ product.featured_media | image_url: width: 550 }} 550w,{%- endif -%}
    {%- if product.featured_media.width >= 1100 -%}{{ product.featured_media | image_url: width: 1100 }} 1100w,{%- endif -%}
    {{ product.featured_media | image_url }} {{ product.featured_media.width }}w
  "
  src="{{ product.featured_media | image_url: width: 550 }}"
  sizes="{{ image_sizes }}"
  alt="{{ product.featured_media.alt | escape }}"
  loading="lazy"
>
```

### 4. Section Settings Integration
```liquid
<style>
  .section-{{ section.id }}-padding {
    padding-top: {{ section.settings.padding_top }}px;
    padding-bottom: {{ section.settings.padding_bottom }}px;
  }
  
  @media screen and (min-width: 750px) {
    .section-{{ section.id }}-padding {
      padding-top: {{ section.settings.desktop_padding_top }}px;
      padding-bottom: {{ section.settings.desktop_padding_bottom }}px;
    }
  }
</style>

<div class="section-{{ section.id }}-padding">
  <!-- Section content -->
</div>
```

## Advanced JavaScript Integration

### 1. Custom Elements Pattern
```javascript
// Wishlist functionality
class WishlistProduct extends HTMLElement {
  constructor() {
    super();
    this.addEventListener("click", this.onAddWishlist);
    this.LOCAL_STORAGE_WISHLIST_KEY = "shopify-wishlist";
    this.onAddActiveClass();
    this.WishlistItemCounter();
  }
  
  updateWishlist(productHandle) {
    let wishlist = this.getWishlist();
    let wishlistIndex = wishlist.indexOf(productHandle);
    
    if (wishlistIndex === -1) {
      wishlist.push(productHandle);
    } else {
      wishlist.splice(wishlistIndex, 1);
    }
    
    localStorage.setItem(this.LOCAL_STORAGE_WISHLIST_KEY, wishlist.join(','));
  }
}

customElements.define('wishlist-product', WishlistProduct);
```

### 2. Local Storage Integration
```liquid
{%- comment -%}
  Wishlist button with JavaScript integration
{%- endcomment -%}
<wishlist-product>
  <button 
    type="button"
    data-product-handle="{{ product.handle }}"
    aria-label="Add to wishlist"
  >
    {% render 'icon-heart' %}
    <span class="wishlist-text">Add to Wishlist</span>
  </button>
</wishlist-product>

<script>
  // Initialize wishlist counter
  document.addEventListener('DOMContentLoaded', function() {
    const wishlistCount = document.querySelector('.wishlist__count');
    const savedWishlist = localStorage.getItem('shopify-wishlist');
    if (savedWishlist && wishlistCount) {
      wishlistCount.textContent = savedWishlist.split(',').length;
    }
  });
</script>
```

### 3. Dynamic Styling with Liquid
```liquid
{%- comment -%}
  Inline styles generated from section settings
{%- endcomment -%}
{%- style -%}
  .section-{{ section.id }}-padding {
    padding-top: {{ section.settings.mobile_padding_top }}px;
    padding-bottom: {{ section.settings.mobile_padding_bottom }}px;
    --padding-top: {{ section.settings.mobile_padding_top }}px;
  }
  
  @media screen and (min-width: 750px) {
    .section-{{ section.id }}-padding {
      padding-top: {{ section.settings.padding_top }}px;
      padding-bottom: {{ section.settings.padding_bottom }}px;
    }
  }
  
  {%- if section.settings.custom_color -%}
    .section-{{ section.id }} {
      --custom-color: {{ section.settings.custom_color }};
    }
  {%- endif -%}
{%- endstyle -%}
```

## Best Practices

### 1. Performance Optimization
```liquid
{%- liquid
  # Use liquid tag for multiple assignments
  assign product_count = collection.products.size
  assign show_pagination = false
  if product_count > 12
    assign show_pagination = true
  endif
-%}

{%- comment -%}
  Use comments to explain complex logic
{%- endcomment -%}

{%- # Use whitespace control to minimize output -%}
```

### 2. Error Handling
```liquid
{%- if product != blank -%}
  {{ product.title }}
{%- else -%}
  <p>Product not found</p>
{%- endif -%}

{%- if product.featured_media -%}
  <img src="{{ product.featured_media | image_url: width: 300 }}" alt="{{ product.featured_media.alt | escape }}">
{%- else -%}
  {{ 'product-1' | placeholder_svg_tag }}
{%- endif -%}
```

### 3. Accessibility
```liquid
<img 
  src="{{ image | image_url: width: 300 }}"
  alt="{{ image.alt | escape }}"
  loading="lazy"
>

<button 
  type="button"
  aria-label="{{ 'products.product.add_to_cart' | t }}"
  aria-describedby="product-{{ product.id }}-price"
>
  Add to Cart
</button>
```

## Advanced Theme Features

### 1. Lookbook with Hotspots
```liquid
{%- comment -%}
  Interactive lookbook with product hotspots
{%- endcomment -%}
<div class="lookbook-slider">
  {%- for block in section.blocks -%}
    {%- case block.type -%}
      {%- when 'look' -%}
        <div class="lookbook-slide">
          <div class="lookbook-image">
            <img src="{{ block.settings.image | image_url }}" alt="">
            
            {%- assign product = all_products[block.settings.product] -%}
            <button 
              class="lookbook-hotspot"
              style="left: {{ block.settings.hotspot_x }}%; top: {{ block.settings.hotspot_y }}%;"
              data-product-id="{{ product.id }}"
            >
              <span class="hotspot-pulse"></span>
              <span class="hotspot-price">{{ product.price | money }}</span>
            </button>
          </div>
        </div>
    {%- endcase -%}
  {%- endfor -%}
</div>
```

### 2. Tab Collage System
```liquid
{%- comment -%}
  Advanced tab system with multiple content types
{%- endcomment -%}
<div class="tab-collage" data-behavior="{{ section.settings.tab_display_behaviour }}">
  <div class="tab-navigation">
    {%- for block in section.blocks -%}
      <button class="tab-button" data-tab="{{ forloop.index }}">
        {{ block.settings.heading }}
      </button>
    {%- endfor -%}
  </div>
  
  <div class="tab-content">
    {%- for block in section.blocks -%}
      <div class="tab-panel" data-panel="{{ forloop.index }}">
        {%- case block.type -%}
          {%- when 'image' -%}
            <img src="{{ block.settings.image | image_url }}" alt="">
          {%- when 'video' -%}
            <video-component data-url="{{ block.settings.video_url }}">
          {%- when 'collection' -%}
            {%- assign collection = collections[block.settings.collection] -%}
            {%- for product in collection.products limit: 4 -%}
              {%- render 'product-card', product: product -%}
            {%- endfor -%}
        {%- endcase -%}
      </div>
    {%- endfor -%}
  </div>
</div>
```

### 3. Advanced Color Swatches
```liquid
{%- comment -%}
  Dynamic color swatches with image variants
{%- endcomment -%}
{%- liquid
  assign swatch_option = settings.color_swatch_activation | downcase
  assign color_option_index = 0
  
  for option in product.options_with_values
    assign option_name = option.name | downcase
    if option_name contains swatch_option
      assign color_option_index = forloop.index0
      break
    endif
  endfor
-%}

<div class="color-swatches">
  {%- for value in product.options_with_values[color_option_index].values -%}
    {%- assign variant_for_value = product.variants | where: product.options[color_option_index], value | first -%}
    
    <label class="color-swatch">
      <input 
        type="radio" 
        name="options[{{ product.options[color_option_index] }}]"
        value="{{ value | escape }}"
        {% if forloop.first %}checked{% endif %}
      >
      
      {%- if settings.color_swatch_type == 'image' and variant_for_value.featured_media -%}
        <span class="swatch-image">
          <img 
            src="{{ variant_for_value.featured_media | image_url: width: 60 }}"
            alt="{{ value }}"
            loading="lazy"
          >
        </span>
      {%- else -%}
        <span 
          class="swatch-color"
          style="background-color: {{ value | replace: ' ', '' | downcase }};"
          title="{{ value }}"
        ></span>
      {%- endif -%}
    </label>
  {%- endfor -%}
</div>
```

### 4. Custom Font Loading
```liquid
{%- comment -%}
  Dynamic font loading with custom fonts
{%- endcomment -%}
{%- liquid
  assign body_fonts = settings.custom_body_font | split: '&'
  assign heading_fonts = settings.custom_heading_font | split: '&'
-%}

{%- if settings.use_custom_body_font and settings.custom_body_font != blank -%}
  {%- for font in body_fonts -%}
    {%- assign font_URL = font | split: '@' | first -%}
    {%- assign font_Weight = font | split: '@' | last -%}
    <style>
      @font-face {
        font-family: Body-Font;
        font-weight: {{ font_Weight }};
        src: url({{ font_URL }});
        font-display: swap;
      }
    </style>
  {%- endfor -%}
{%- endif -%}
```

This guide provides a comprehensive overview of how Liquid code is structured in Shopify themes, using real examples from the Glade theme to illustrate best practices and common patterns.