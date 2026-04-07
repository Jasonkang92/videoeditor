# Accessibility Standards (WCAG 2.1 Level AA)

## Table of Contents
1. [WCAG 2.1 Compliance](#wcag-21-compliance)
2. [Color & Contrast](#color--contrast)
3. [Keyboard Navigation](#keyboard-navigation)
4. [Screen Reader Support](#screen-reader-support)
5. [ARIA Labels & Roles](#aria-labels--roles)
6. [Focus Management](#focus-management)
7. [Semantic HTML](#semantic-html)
8. [Testing Tools](#testing-tools)
9. [Accessibility Checklist](#accessibility-checklist)

---

## WCAG 2.1 Compliance

### Accessibility Levels

```
Level A:
- Basic accessibility
- Minimum compliance
- Minimum contrast (4.5:1)

Level AA:
- Enhanced accessibility
- Most common requirement
- Contrast 4.5:1 for normal text, 3:1 for large
- Recommended for public websites/apps

Level AAA:
- Advanced accessibility
- Contrast 7:1 for normal text
- More restrictive
- For specialized applications

Target: WCAG 2.1 Level AA
```

---

## Color & Contrast

### Contrast Ratios

```
Minimum for WCAG AA:
- Normal text (< 18pt or 14px bold): 4.5:1
- Large text (≥ 18pt or 14px bold): 3:1
- UI components and graphics: 3:1

Recommended for AAA:
- Normal text: 7:1
- Large text: 4.5:1

Examples:
✓ Black (#000000) on white (#FFFFFF): 21:1 ✓
✗ Gray (#777777) on white (#FFFFFF): 4.48:1 ✗
✓ Dark blue (#003366) on white (#FFFFFF): 12.63:1 ✓
```

### Check Contrast

```javascript
// Use tools:
// - WebAIM Contrast Checker
// - Accessibility Metrics Browser Extensions
// - Chrome DevTools Lighthouse

// Example CSS
body {
  color: #212121;        /* Dark gray text */
  background-color: #f5f5f5; /* Light background */
  /* Contrast: 14.5:1 ✓ */
}

a {
  color: #0066cc;        /* Blue links */
  /* Link contrast: 8.6:1 ✓ */
}
```

---

## Keyboard Navigation

### Tab Order & Shortcuts

```html
<!-- ✅ Logical tab order -->
<form>
  <input type="text" placeholder="Name" />
  <input type="email" placeholder="Email" />
  <button type="submit">Submit</button>
</form>

<!-- ✅ Custom tab index (use sparingly) -->
<button tabindex="0">Primary action</button>
<button tabindex="-1">Hidden from tab order</button>

<!-- ✅ Skip links for keyboard users -->
<body>
  <a href="#main-content" class="skip-link">Skip to main content</a>
  <nav>Navigation here</nav>
  <main id="main-content">Main content here</main>
</body>

.skip-link {
  position: absolute;
  left: -10000px;
  top: auto;
  width: 1px;
  height: 1px;
  overflow: hidden;
}

.skip-link:focus {
  position: static;
  width: auto;
  height: auto;
}
```

### Keyboard Shortcuts

```javascript
// ✅ Shortcuts for power users
document.addEventListener('keydown', (event) => {
  // Ctrl+K: Open search
  if (event.ctrlKey && event.key === 'k') {
    openSearch();
  }
  
  // ?: Show help
  if (event.key === '?') {
    showKeyboardShortcuts();
  }
});

// Always allow browser shortcuts:
// - Tab: Navigate
// - Enter: Activate button
// - Space: Toggle checkbox/radio
// - Arrow keys: Select option
```

---

## Screen Reader Support

### Testing with Screen Readers

```
Windows:
- NVDA (free): https://www.nvaccess.org/
- JAWS (paid): https://www.freedomscientific.com/

macOS:
- VoiceOver (built-in)

Linux:
- Orca (GNOME)

Web:
- WebAIM Screen Reader Testing
```

### Screen Reader Best Practices

```html
<!-- ✅ Provide alt text for images -->
<img src="video-thumbnail.jpg" alt="Video placeholder showing person speaking into microphone" />

<!-- ✅ Use semantic HTML -->
<header>...</header>
<nav>...</nav>
<main>...</main>
<article>...</article>
<aside>...</aside>
<footer>...</footer>

<!-- ✅ Label form fields -->
<label for="email">Email address:</label>
<input type="email" id="email" name="email" />

<!-- ✅ Describe complex images -->
<figure>
  <img src="chart.png" alt="Revenue by quarter" />
  <figcaption>
    Revenue increased 25% Q1 to Q4, with peak in Q3 at $2.5M
  </figcaption>
</figure>

<!-- ❌ Avoid -->
<img src="image.png" alt="image" />  <!-- Unhelpful alt text -->
<div onclick="click()">Click me</div>  <!-- Not keyboard accessible -->
```

---

## ARIA Labels & Roles

### ARIA Best Practices

```html
<!-- ✅ Use native HTML when possible (better than ARIA) -->
<button>Submit</button>           <!-- Not role="button" div -->
<input type="checkbox" />          <!-- Not role="checkbox" div -->
<nav>Navigation</nav>              <!-- Not role="navigation" div -->

<!-- ✅ ARIA for complex widgets -->
<div role="tablist">
  <button role="tab" aria-selected="true" aria-controls="panel1">
    Tab 1
  </button>
  <button role="tab" aria-selected="false" aria-controls="panel2">
    Tab 2
  </button>
</div>

<div id="panel1" role="tabpanel" aria-labelledby="tab1">
  Panel 1 content
</div>

<!-- ✅ aria-label for icon buttons -->
<button aria-label="Close dialog">
  <span aria-hidden="true">×</span>
</button>

<!-- ✅ aria-describedby for additional description -->
<input type="password" aria-describedby="pwd-hint" />
<div id="pwd-hint">Password must be at least 8 characters</div>

<!-- ✅ aria-live for dynamic updates -->
<div aria-live="polite" aria-atomic="true" id="status">
  <!-- Status messages updated dynamically -->
</div>
```

---

## Focus Management

### Visible Focus Indicators

```css
/* ✅ Clear focus styles */
button:focus,
input:focus,
a:focus {
  outline: 3px solid #0066cc;
  outline-offset: 2px;
}

/* ❌ Don't remove focus outline without replacement */
button:focus {
  outline: none;  /* 🔴 WRONG - keyboard users need this */
}

/* ✅ Custom focus if outline doesn't work -->
button:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(0, 102, 204, 0.5);  /* Alternative */
}
```

### Focus Trap in Modals

```javascript
function createAccessibleModal(modalElement) {
  const focusableElements = modalElement.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];

  modalElement.addEventListener('keydown', (event) => {
    if (event.key === 'Tab') {
      if (event.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    }
    
    // Esc to close
    if (event.key === 'Escape') {
      closeModal();
    }
  });
}
```

---

## Semantic HTML

### Use Semantic Elements

```html
<!-- ✅ Semantic HTML5 elements -->
<header>Page header</header>
<nav>Navigation menu</nav>
<main>Main content</main>
<article>Article content</article>
<section>Section of content</section>
<aside>Sidebar content</aside>
<footer>Page footer</footer>

<!-- ✅ Form semantics -->
<fieldset>
  <legend>Choose options:</legend>
  <label><input type="radio" name="option" /> Option 1</label>
  <label><input type="radio" name="option" /> Option 2</label>
</fieldset>

<!-- ❌ Don't use divs for everything -->
<div class="header">...</div>      <!-- Use <header> -->
<div class="nav">...</div>          <!-- Use <nav> -->
<div class="button" onclick="...">  <!-- Use <button> -->

<!-- ✅ Use correct heading hierarchy -->
<h1>Page Title</h1>
<h2>Section</h2>
<h3>Subsection</h3>
<h4>Sub-subsection</h4>

<!-- ❌ Don't skip heading levels -->
<h1>Title</h1>
<h3>Subsection</h3>  <!-- Skips h2 ❌ -->
```

---

## Testing Tools

### Automated Testing Tools

```
Browser Extensions:
- axe DevTools (axe-core)
- WAVE
- Lighthouse
- Color Contrast Analyzer

Command Line:
- axe-core CLI
- PA11y
- WebAIM tools

Online:
- WebAIM Contrast Checker
- WebAIM Color Contrast Checker
```

### Lighthouse Accessibility Audit

```bash
# Run Lighthouse
npm install -g lighthouse
lighthouse https://example.com --view

# Check accessibility score in report
# Target: ≥ 90/100
```

---

## Accessibility Checklist

### Development Checklist

- [ ] WCAG 2.1 Level AA compliance
- [ ] Color contrast 4.5:1 for normal text
- [ ] All images have alt text
- [ ] All form fields have labels
- [ ] Keyboard navigation works
- [ ] Focus indicators visible
- [ ] Semantic HTML used
- [ ] ARIA labels where needed
- [ ] No color as only means
- [ ] Videos have captions
- [ ] No auto-playing media
- [ ] Skip links present
- [ ] Tab order logical
- [ ] Mobile accessible
- [ ] Lighthouse score ≥ 90

### Testing Checklist

- [ ] Tested with screen reader (NVDA/JAWS)
- [ ] Tested keyboard navigation (Tab, Enter, Esc)
- [ ] Tested with browser zoom (200%)
- [ ] Tested with high contrast mode
- [ ] Tested on mobile screen reader
- [ ] axe DevTools scan (0 violations)
- [ ] WAVE scan (0 errors)
- [ ] Lighthouse audit ≥ 90
- [ ] Tested with actual users (if possible)

---

**Last Updated**: April 2026  
**Version**: 1.0  
**Status**: Active
