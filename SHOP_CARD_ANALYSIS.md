# Shop Item Card Complete Breakdown & Conflict Analysis

## 📐 CARD CONTAINER (.s1-item-card)

### Width Controls:
- `width: 100%` - Takes full width of grid cell
- Grid cell width: Controlled by `.s1-items` grid: `grid-template-columns: repeat(2, 1fr)`
- Grid container padding: `.s1-items { padding: 10px }`
- Grid gap: `.s1-items { gap: 12px }`

### Height Controls:
- `height: 0` - Collapsed height
- `padding-bottom: 100%` - Creates square aspect ratio (height = width)
- **CONFLICT**: Card has `padding: 0` but uses `padding-bottom: 100%` - this is intentional for aspect ratio trick

### Positioning:
- `position: relative` - Creates positioning context
- `overflow: hidden` - Clips content
- `box-sizing: border-box` - Includes border in sizing

### Border:
- `border: 2px solid rgba(255, 255, 255, 0.3)` - 2px border affects internal space
- `border-radius: 10px` - Rounded corners

---

## 🎯 ABSOLUTE POSITIONED CHILDREN

### Rule: `.s1-item-card > *`
- `position: absolute` - All direct children are absolutely positioned
- `position: relative` - But then overridden to relative? **CONFLICT!**
- `z-index: 2` - Above decorative elements

**ISSUE**: This rule sets `position: relative` but individual children override with `position: absolute`. This is redundant.

---

## 💰 PRICE TAG (.s1-item-price)

### Position:
- `position: absolute` (redundant - already set by `.s1-item-card > *`)
- `top: 8px`
- `left: 8px`
- `z-index: 10` - Above other content

### Size:
- `max-width: calc(100% - 24px)` - Prevents overflow (8px left + 8px right + 8px buffer)
- No explicit width/height - Content-based sizing

### Spacing:
- `padding: 5px 9px` - Internal spacing
- `font-size: 12px`
- `border-radius: 6px`

**CALCULATION**: 
- Top space: 8px
- Price tag height: ~22px (12px font + 10px padding)
- Total top area: ~30px

---

## 📦 HEADER AREA (.s1-item-card > .s1-item-header)

### Position:
- `position: absolute` (redundant)
- `top: 28px` - Starts below price tag area
- `left: 8px` - 8px from left edge
- `right: 8px` - 8px from right edge
- `bottom: 50px` - 50px from bottom (space for footer)

### Size Calculation:
- Available width: `100% - 16px` (8px left + 8px right)
- Available height: `Card height - 28px (top) - 50px (bottom) = Card height - 78px`

### Internal Spacing:
- `padding: 4px 2px` - Vertical 4px, horizontal 2px
- `gap: 6px` - Space between flex children (icon, label, stats)
- `box-sizing: border-box` - Padding included in size

### Layout:
- `display: flex`
- `flex-direction: column`
- `align-items: center`
- `justify-content: flex-start`
- `overflow-y: auto` - Scrollable if content overflows

**CONFLICT**: There's also `.s1-item-header` (without `>`) that has:
- `width: 100%`
- `height: 100%`
- `gap: 4px` (different from the absolute positioned version's 6px!)

This standalone rule might not be used since header is always a direct child.

---

## 🎨 ICON (.s1-item-icon)

### Size:
- `width: 48px`
- `height: 48px`
- `min-width: 48px` (redundant - same as width)
- `min-height: 48px` (redundant - same as height)
- `max-width: 48px` (redundant - same as width)
- `max-height: 48px` (redundant - same as height)

### Spacing:
- `margin-bottom: 2px` - Space below icon
- `font-size: 32px` - Icon size

**CONFLICT**: Icon has `margin-bottom: 2px` but header has `gap: 6px`. The gap should handle spacing, making margin-bottom redundant or causing double spacing.

**CALCULATION**:
- Icon height: 48px
- Margin bottom: 2px
- Total: 50px

---

## 🏷️ LABEL (.s1-item-label)

### Size:
- `width: 100%` - Full width of header
- `max-height: 24px` - Limits height
- `line-height: 1.2` - Text line height
- `font-size: 12px`

### Spacing:
- `margin: 0` - No margin
- `padding: 0 4px` - Horizontal padding only
- `flex-shrink: 0` - Won't shrink

**CALCULATION**:
- Label height: ~14-24px (depends on text, max 24px)
- Padding: 0px vertical

**CONFLICT**: Label has `padding: 0 4px` but header has `padding: 4px 2px`. The header padding already provides horizontal space, making label padding potentially redundant.

---

## 📊 STATS SECTION (.s1-item-stats)

### Size:
- `width: 100%` - Full width
- `max-height: 70px` - Maximum height before scrolling
- `min-height: 0` - Can shrink
- `flex-shrink: 1` - Can shrink to fit

### Spacing:
- `gap: 3px` - Space between stat items
- `margin-top: 4px` - Space above stats
- `padding: 0 2px` - Horizontal padding

**CONFLICT**: 
1. Stats has `margin-top: 4px` but header has `gap: 6px`. The gap should handle spacing between label and stats, making margin-top redundant or causing double spacing.
2. Stats has `padding: 0 2px` but header already has `padding: 4px 2px`. This creates nested padding.

**CALCULATION**:
- Max stats height: 70px
- Each stat item: ~18-20px (11px font + 6px padding + line-height)
- With 3px gap, can fit ~3-4 stats before scrolling

---

## 📝 STAT ITEM (.s1-item-stat)

### Size:
- No explicit width/height - Flex-based
- `min-width: 0` - Can shrink
- `flex-shrink: 0` - Won't shrink individually

### Spacing:
- `padding: 3px 6px` - Internal spacing
- `line-height: 1.3` - Text line height
- `font-size: 11px`

**CALCULATION**:
- Stat height: ~17-20px (11px font × 1.3 line-height + 6px padding)

---

## 🔘 FOOTER AREA (.s1-item-card > .s1-item-footer)

### Position:
- `position: absolute` (redundant)
- `bottom: 8px` - 8px from bottom
- `left: 8px` - 8px from left
- `right: 8px` - 8px from right
- `z-index: 10` - Above other content

### Size:
- `width: 100%` - Full width (but constrained by left/right)
- `height: 38px`
- `min-height: 38px` (redundant)
- `max-height: 38px` (redundant)

**CALCULATION**:
- Footer height: 38px
- Bottom space: 8px
- Total bottom area: 46px

**CONFLICT**: Header has `bottom: 50px` but footer is only 38px + 8px = 46px. There's a 4px discrepancy.

---

## 🛒 BUY BUTTON (.s1-item-buy)

### Size:
- `width: 100%` - Full width of footer
- `height: 100%` - Full height of footer
- `min-height: 38px` (redundant - footer is 38px)
- `max-height: 38px` (redundant - footer is 38px)

### Spacing:
- `padding: 0` - No padding
- `font-size: 11px`
- `letter-spacing: 0.5px`

---

## 🔍 IDENTIFIED CONFLICTS & ISSUES

### 1. **Redundant Position Declarations**
- `.s1-item-card > *` sets `position: relative` but children override with `position: absolute`
- Individual children declare `position: absolute` even though parent rule already sets it

### 2. **Double Spacing Conflicts**
- Icon `margin-bottom: 2px` + header `gap: 6px` = potential 8px gap (should be 6px)
- Stats `margin-top: 4px` + header `gap: 6px` = potential 10px gap (should be 6px)

### 3. **Nested Padding Conflicts**
- Header `padding: 4px 2px` + Label `padding: 0 4px` = nested horizontal padding
- Header `padding: 4px 2px` + Stats `padding: 0 2px` = nested horizontal padding

### 4. **Height Calculation Mismatch**
- Header `bottom: 50px` suggests 50px reserved for footer
- Footer actual: 38px height + 8px bottom = 46px
- **4px discrepancy** - Header could extend 4px lower

### 5. **Redundant Size Constraints**
- Icon: width/height + min/max all set to same 48px
- Footer: height + min-height + max-height all set to 38px
- Button: height + min-height + max-height all set to 38px

### 6. **Duplicate Header Rules**
- `.s1-item-card > .s1-item-header` (absolute positioned)
- `.s1-item-header` (standalone, different gap value)
- The standalone rule might not apply but creates confusion

### 7. **Stats Max-Height vs Available Space**
- Stats `max-height: 70px`
- Header available height: `Card height - 78px` (28px top + 50px bottom)
- For a typical card (e.g., 150px tall): Available = 72px
- Stats max-height (70px) + margin-top (4px) = 74px - **Potential overflow!**

---

## 📏 SPACING CALCULATION SUMMARY

### Vertical Space Breakdown (from top):
1. **Top area**: 8px (price tag top)
2. **Price tag**: ~22px (12px font + 10px padding)
3. **Gap to header**: 28px - 22px - 8px = **-2px** (overlap or tight spacing)
4. **Header padding top**: 4px
5. **Icon**: 48px
6. **Icon margin**: 2px
7. **Header gap**: 6px
8. **Label**: ~14-24px
9. **Header gap**: 6px
10. **Stats margin-top**: 4px
11. **Stats**: up to 70px
12. **Header padding bottom**: 4px
13. **Footer area**: 46px (38px + 8px)

**Total**: 8 + 22 + 4 + 48 + 2 + 6 + 20 + 6 + 4 + 70 + 4 + 46 = **240px minimum**

For a square card in a grid, if grid cell is ~150px wide, card height is 150px. **This won't fit!**

---

## ✅ RECOMMENDED FIXES

1. Remove redundant position declarations
2. Remove conflicting margins (icon margin-bottom, stats margin-top)
3. Consolidate padding (remove nested padding)
4. Fix header bottom calculation (should be 46px, not 50px)
5. Adjust stats max-height based on actual available space
6. Remove redundant min/max constraints
7. Remove or clarify duplicate header rule

