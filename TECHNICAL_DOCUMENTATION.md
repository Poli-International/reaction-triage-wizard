# Tattoo & Piercing Reaction Triage Wizard - Technical Documentation

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Data Schemas](#data-schemas)
3. [Calculation / Logic Algorithms](#calculation--logic-algorithms)
4. [API Reference](#api-reference)
5. [Integration Guide](#integration-guide)
6. [Customization](#customization)
7. [Performance](#performance)
8. [Browser Compatibility](#browser-compatibility)
9. [Security](#security)
10. [Version History](#version-history)
11. [Support / Contact](#support--contact)

## Architecture Overview

### Technology Stack

- **HTML5** - Semantic markup with meta tags for viewport and description
- **CSS3** - Linked external stylesheet at `/tools/reaction-triage-wizard/css/style.css`
- **JavaScript (ES6)** - Single application file at `/tools/reaction-triage-wizard/js/app.js`
- **No external dependencies** - Zero libraries, frameworks, or CDN resources

### File Structure

```
/tools/reaction-triage-wizard/
├── index.html          # Main entry point, tool wrapper, disclaimer
├── css/
│   └── style.css       # All styling (external file)
└── js/
    └── app.js          # All logic: state management, rendering, event handling
```

### Component / Logic Breakdown

The application is a single-page wizard with two primary rendering modes:

1. **Question Mode** - Displays a progress bar, question text, and clickable option buttons
2. **Result Mode** - Displays a verdict banner, explanation, action list, and optional jewellery recommendation

State management is handled entirely through two global variables (`history` and `currentKey`) and a decision tree object (`TREE`). No frameworks, routing, or external state libraries are used.

## Data Schemas

### Decision Tree Node (`TREE` object)

Each key in the `TREE` object represents a step in the wizard. The `start` key is the entry point.

```javascript
{
  // Node key (string): unique identifier for each question step
  "start": {
    // q (string): The question displayed to the user
    q: "What type of procedure did you have?",
    
    // opts (array of objects): Available answer choices
    opts: [
      {
        icon: "💉",           // Emoji displayed as visual indicator
        text: "Body piercing", // Primary option text
        sub: "Any body piercing (not tattoo)", // Secondary descriptive text
        next: "p_timing"      // Next node key OR result key prefixed with "R:"
      }
    ]
  }
}
```

**Example values for `next` field:**
- `"p_timing"` - Navigates to another question node
- `"R:normal_healing"` - Navigates to a result (prefixed with `R:`)

### Result Object (`RESULTS` object)

```javascript
{
  // Result key (string): unique identifier for each outcome
  "normal_healing": {
    level: "normal",           // CSS class suffix: "level-normal"
    icon: "✅",                // Emoji displayed in result banner
    verdict: "Normal healing", // Primary result title
    sub: "What you are experiencing is expected.", // Secondary subtitle
    explanation: "Your symptoms are consistent with the standard inflammatory...", // Detailed description
    actions: [                 // Array of recommended action strings
      "Continue twice-daily sterile saline rinse (0.9% NaCl wound wash)",
      "Do not touch the piercing with unwashed hands"
    ],
    bioflex: false             // Boolean: whether to show BioFlex® recommendation section
  }
}
```

**All result keys:** `normal_healing`, `irritation_adjust`, `see_piercer`, `see_doctor`, `urgent`

**All `level` values:** `"normal"`, `"adjust"`, `"piercer"`, `"doctor"`, `"urgent"`

### Wizard State Variables

```javascript
let history = [];    // Array of node keys (strings) tracking navigation path
let currentKey = "start"; // String: current node or result key being displayed
const totalSteps = 5; // Number used for approximate progress calculation
```

## Calculation / Logic Algorithms

### Progress Calculation

**Function:** `getProgress()`

```javascript
function getProgress() {
  return Math.min(100, Math.round(history.length / totalSteps * 100));
}
```

**Algorithm:**
1. Divide the length of the `history` array (number of answered questions) by `totalSteps` (5)
2. Multiply by 100 to get percentage
3. Round to nearest integer
4. Cap at 100 using `Math.min(100, ...)`

**Example:** After 2 questions answered: `Math.min(100, Math.round(2 / 5 * 100))` = 40%

### Navigation Logic

**Function:** `render(nodeKey)`

1. Set `currentKey = nodeKey`
2. Check if `nodeKey` starts with `"R:"`:
   - If yes: call `renderResult(nodeKey.slice(2))` and exit
3. Look up node in `TREE` object using `nodeKey`
4. Generate back button HTML if `history.length > 0`
5. Build option buttons HTML from `node.opts` array
6. Render HTML into `wizardEl` element
7. Attach click event listeners to each option button:
   - Push `currentKey` onto `history` array
   - Call `render(btn.dataset.next)` with the button's `data-next` attribute
8. Attach click event to back button:
   - Call `render(history.pop())` to navigate to previous node

**Function:** `renderResult(resultKey)`

1. Look up result in `RESULTS` object using `resultKey`
2. Build actions HTML list from `r.actions` array
3. Conditionally build BioFlex® recommendation HTML if `r.bioflex === true`
4. Render result card with banner, explanation, actions, and optional jewellery section
5. Attach click event to restart button:
   - Reset `history = []`
   - Call `render("start")`

### HTML Escaping

**Function:** `escHtml(s)`

```javascript
function escHtml(s) {
  return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
```

**Algorithm:**
1. Convert input to string (or empty string if null/undefined)
2. Replace `&` with `&amp;`
3. Replace `<` with `&lt;`
4. Replace `>` with `&gt;`
5. Replace `"` with `&quot;`
6. Return escaped string

## API Reference

### Public Functions

All functions are defined in the global scope within `app.js`.

| Function | Parameters | Returns | Description |
|----------|------------|---------|-------------|
| `escHtml(s)` | `s` (any) | String | Escapes HTML special characters for safe rendering |
| `getProgress()` | None | Number (0-100) | Calculates approximate progress percentage |
| `render(nodeKey)` | `nodeKey` (string) | undefined | Renders question or result view based on node key |
| `renderResult(resultKey)` | `resultKey` (string) | undefined | Renders result view with verdict, explanation, and actions |

### Event Handlers

- **Option button click:** Pushes current node to history, calls `render()` with next node key
- **Back button click:** Pops last node from history, calls `render()` with previous node
- **Restart button click:** Resets history array, calls `render("start")`

### DOM References

- `wizardEl` - References `document.getElementById('wizard')` (the main content container)

## Integration Guide

### Standalone Embedding

The tool is hosted at:
```
https://poliinternational.com/tools/reaction-triage-wizard/
```

### Iframe Embedding

The tool includes built-in iframe detection and theme support:

```html
<iframe 
  src="https://poliinternational.com/tools/reaction-triage-wizard/"
  width="100%" 
  height="600"
  frameborder="0"
  allowtransparency="true"
  title="Tattoo & Piercing Reaction Triage Wizard">
</iframe>
```

**Theme control via postMessage:**
```javascript
// Send theme preference to iframe
iframe.contentWindow.postMessage({
  type: 'poli-theme',
  light: true  // false for dark mode
}, '*');
```

### Dependencies

- **Zero external dependencies** - The tool is fully self-contained with HTML, CSS, and JavaScript
- No jQuery, React, Vue, or any framework required
- No CDN resources loaded

## Customization

### Modifying Decision Tree

Edit the `TREE` object in `js/app.js`:

- Add new nodes with unique keys following the schema
- Update `opts` arrays to add or remove answer choices
- Change `next` values to redirect to different nodes or results
- Ensure all referenced node keys exist in the `TREE` object

### Modifying Results

Edit the `RESULTS` object in `js/app.js`:

- Update `actions` arrays to change recommended steps
- Modify `explanation` text for different clinical reasoning
- Set `bioflex: true` to show jewellery recommendation section
- Change `level` values to adjust CSS styling (must match existing CSS classes)

### Styling

All visual styling is in `/tools/reaction-triage-wizard/css/style.css`. Key CSS classes:

- `.level-normal`, `.level-adjust`, `.level-piercer`, `.level-doctor`, `.level-urgent` - Result banner color coding
- `.opt-btn` - Option button styling
- `.step-card` - Question card container
- `.result-card` - Result display container

## Performance

- **Single HTTP request** for JavaScript (minimal file size)
- **No DOM manipulation libraries** - Direct innerHTML updates with event delegation
- **No animations or transitions** that could cause layout thrashing
- **No external API calls** - All logic runs client-side with zero network requests
- **No images** - All visual indicators use emoji characters

## Browser Compatibility

- **ES6 JavaScript** - Requires modern browser support for:
  - `const` and `let` declarations
  - Arrow functions
  - Template literals (used in HTML generation)
  - `String.replace()` with regex
  - `Array.map()` and `Array.join()`
- **CSS3** - Standard properties only, no vendor prefixes required
- **Supported browsers:** Chrome 49+, Firefox 52+, Safari 10+, Edge 14+, Opera 36+
- **Not supported:** Internet Explorer 11 or earlier

## Security

### Input Handling

- All user-facing text is escaped using `escHtml()` before rendering to DOM
- The `escHtml()` function handles: `&`, `<`, `>`, `"`
- No user input fields exist - all interaction is through predefined buttons
- No form submissions or data persistence

### XSS Prevention

- Dynamic content (question text, option text, result text) is always passed through `escHtml()`
- No `innerHTML` with unescaped user data
- No `eval()` or dynamic script execution
- No URL parameters or query string processing

### Iframe Security

- The tool includes `<meta name="robots" content="noindex, nofollow">` to prevent search indexing
- Iframe detection script runs on page load to apply appropriate theme
- postMessage listener only accepts messages with `type: 'poli-theme'`

## Version History

| Version | Date | Description |
|---------|------|-------------|
| 1.0.0 | Initial release | Complete decision tree for tattoo and piercing reactions with 5 result levels |

## Support / Contact

For technical issues, content corrections, or integration questions:

- **Email:** support@poliinternational.com
- **Website:** https://poliinternational.com
- **Tool URL:** https://poliinternational.com/tools/reaction-triage-wizard/
