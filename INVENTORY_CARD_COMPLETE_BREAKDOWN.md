# Inventory Item Card - Complete Component Breakdown

## HTML Structure (from `js/shop-ui.js`)

```html
<div class="i1-item-card">
  <div class="i1-item-header">
    <div class="i1-item-icon">${svgIcon}</div>
    <div class="i1-item-label">${item.name}</div>
  </div>
  <div class="i1-item-quantity">${quantity > 1 ? quantity : ''}</div>
  <div class="i1-item-footer">
    <button class="i1-item-equip">EQ</button>
    <!-- OR -->
    <button class="i1-item-use">Use</button>
  </div>
</div>
```

---

## Container Hierarchy & Dimensions

### 1. `.i1-container` (Inventory Container)
- **Width:** `max-width: 360px` (desktop), `calc(100vw - 20px)` (mobile)
- **Height:** `max-height: 600px`
- **Padding:** `15px` (all sides)
- **Box-sizing:** `border-box`
- **Border:** `2px solid rgba(255, 255, 255, 0.3)`
- **Effective inner width (desktop):** `360px - 15px*2 - 2px*2 = 326px`

### 2. `.i1-items` (Grid Container)
- **Layout:** `display: grid`
- **Columns:** `grid-template-columns: repeat(2, 1fr)` (2 equal columns)
- **Gap:** `12px` (between cards)
- **Padding:** `10px` (all sides)
- **Box-sizing:** `border-box`
- **Effective width for cards:** `326px - 10px*2 = 306px`
- **Available width per column:** `(306px - 12px) / 2 = 147px`

### 3. `.i1-item-card` (Individual Card)
- **Position:** `position: relative` (creates positioning context)
- **Width:** `width: 100%` (fills its grid column = 147px)
- **Aspect Ratio:** `aspect-ratio: 1` (creates square, height = width)
  - **Actual height:** `147px` (same as width)
- **Border:** `2px solid rgba(255, 255, 255, 0.3)` (adds 4px total to dimensions)
- **Border-radius:** `10px`
- **Padding:** `12px` (all sides) ⚠️ **DIFFERENT FROM SHOP CARDS**
- **Box-sizing:** `border-box` (border and padding included in 147px)
- **Layout:** `display: flex; flex-direction: column; align-items: center; justify-content: space-between`
- **Overflow:** `hidden` (clips content outside)
- **Actual content area:** `147px × 147px` (border is inside due to box-sizing)
- **Effective inner area:** `147px - 12px*2 - 2px*2 = 119px` (width/height)

**⚠️ KEY DIFFERENCE FROM SHOP CARDS:**
- Shop cards: `padding: 0`, `height: 0; padding-bottom: 100%`, absolute positioning
- Inventory cards: `padding: 12px`, `aspect-ratio: 1`, flexbox layout

---

## Card Children Positioning

### 4. `.i1-item-card > *` (All Direct Children)
- **Position:** `position: relative` (from `.i1-item-card > *`)
- **Z-index:** `2` (above background effects)

**⚠️ NOTE:** Unlike shop cards, inventory card children are `position: relative`, not `absolute`. This means they participate in the flexbox layout.

---

## Flexbox Layout Structure

The card uses `display: flex; flex-direction: column; justify-content: space-between`, which means:
- Children are stacked vertically
- Space is distributed between children
- Header content is at the top
- Button is at the bottom

---

### 5. `.i1-item-header` (Content Container)
- **Position:** `position: relative` (from `.i1-item-card > *`)
- **Layout:** Normal flow (flex child)
- **No explicit CSS rules found** - relies on default behavior
- **Content:** Icon and label

**Calculated dimensions:**
- **Width:** `100%` of card inner area = `119px`
- **Height:** Flexible (depends on content)

**Content inside header:**
1. Icon (60px height)
2. Label (~14px height, with 6px margin-top)

**Total content height:** `60px + 6px + 14px = 80px`

---

### 6. `.i1-item-icon` (Icon)
- **Width:** `60px`
- **Height:** `60px`
- **Font-size:** `40px` (for emoji/SVG)
- **Display:** `flex; align-items: center; justify-content: center`
- **Flex-shrink:** `0` (won't shrink)

**Space used:** `60px height`

---

### 7. `.i1-item-label` (Item Name)
- **Font-size:** `12px`
- **Line-height:** `1.2`
- **Margin-top:** `6px`
- **Width:** `100%` (of parent header)
- **Overflow:** `hidden; text-overflow: ellipsis; white-space: nowrap`
- **Text-align:** `center`

**Space used:** `12px × 1.2 = ~14.4px height` + `6px margin-top = ~20px total`

---

### 8. `.i1-item-quantity` (Quantity Badge)
- **Position:** `position: absolute` (overrides `.i1-item-card > *` rule)
- **Top:** `6px` (from top edge of card, accounting for padding)
- **Left:** `6px` (from left edge of card, accounting for padding)
- **Font-size:** `12px`
- **Padding:** `4px 8px` (vertical: 4px, horizontal: 8px)
- **Border-radius:** `6px`
- **Line-height:** Default (~1.2-1.4 × font-size)
- **Estimated height:** `12px × 1.2 + 4px × 2 = ~22.4px`
- **Z-index:** Inherits from parent (likely `2`)

**Space reserved:** Top-left corner, ~22px height

**⚠️ NOTE:** This is absolutely positioned, so it doesn't affect flexbox layout.

---

### 9. `.i1-item-footer` (Footer Container - HTML only)
- **No CSS rules found for `.i1-item-footer`**
- **Layout:** Normal flow (flex child)
- **Content:** Contains the button

**⚠️ ISSUE:** The footer exists in HTML but has no CSS styling. The button inside it is absolutely positioned, so the footer might be empty or have zero height.

---

### 10. `.i1-item-equip, .i1-item-use` (Action Buttons)
- **Position:** `position: absolute` (line 2603)
- **Position:** `position: relative` (line 2620) ⚠️ **CONFLICT!**
- **Bottom:** `6px` (from bottom edge of card, accounting for padding)
- **Left:** `6px` (from left edge of card, accounting for padding)
- **Right:** `6px` (from right edge of card, accounting for padding)
- **Padding:** `8px 6px` (vertical: 8px, horizontal: 6px)
- **Font-size:** `12px`
- **Border-radius:** `6px`
- **Line-height:** Default (~1.2-1.4 × font-size)
- **Estimated height:** `12px × 1.2 + 8px × 2 = ~30.4px`
- **Width:** `119px - 6px - 6px = 107px` (card inner width minus left/right)

**⚠️ CRITICAL CONFLICT:**
- First declaration: `position: absolute;` (line 2603)
- Second declaration: `position: relative;` (line 2620)
- **Result:** `position: relative` wins (last declaration), breaking absolute positioning!

**This means:**
- Button is NOT absolutely positioned as intended
- Button participates in flexbox layout instead
- Button positioning (`bottom`, `left`, `right`) are ignored
- Button will not be at the bottom of the card

---

## Complete Vertical Space Calculation (147px × 147px card)

### Card Dimensions:
- **Outer:** `147px × 147px`
- **Border:** `2px` all sides (inside due to box-sizing)
- **Padding:** `12px` all sides
- **Inner content area:** `119px × 119px`

### Top to Bottom Breakdown:

1. **Quantity badge area:**
   - Top: `6px` (from card inner top, accounting for 12px padding)
   - Height: `~22px`
   - **Reserved:** Top-left corner

2. **Header area (flex child):**
   - Icon: `60px`
   - Gap (margin-top on label): `6px`
   - Label: `~14px`
   - **Total:** `80px`
   - **Position:** Top of flex container (after padding)

3. **Footer/Button area:**
   - **Expected:** `6px` from bottom (absolute positioning)
   - **Actual:** Due to `position: relative` conflict, button is in flexbox flow
   - **Height:** `~30px` (if in flexbox, it would be at bottom due to `justify-content: space-between`)

### Flexbox Layout Calculation:
- **Card inner height:** `119px`
- **Header content:** `80px`
- **Button (if in flexbox):** `~30px`
- **Total used:** `80px + 30px = 110px`
- **Remaining:** `119px - 110px = 9px` (would be distributed as gap)

**But wait:** If button is `position: relative`, it's in the flexbox, so `justify-content: space-between` should push it to the bottom. However, the `bottom`, `left`, `right` properties won't work with `position: relative`.

---

## Issues Identified

### Issue 1: Button Position Conflict ⚠️ CRITICAL
- **Problem:** `.i1-item-equip` and `.i1-item-use` have both `position: absolute` and `position: relative`
- **Location:** Lines 2603 and 2620 in `css/game.css`
- **Impact:** Button is `position: relative`, so `bottom`, `left`, `right` are ignored
- **Fix:** Remove `position: relative` from line 2620, keep only `position: absolute`

### Issue 2: Footer Container Missing CSS
- **Problem:** `.i1-item-footer` has no CSS rules
- **Impact:** Footer might have zero height or unexpected behavior
- **Fix:** Either add CSS for footer, or remove it from HTML and position button directly

### Issue 3: Inconsistent Layout Approach
- **Problem:** Inventory cards use flexbox + absolute positioning mix
- **Impact:** More complex than shop cards, potential for conflicts
- **Note:** This might be intentional, but needs verification

### Issue 4: Quantity Badge Positioning
- **Status:** ✅ Correctly absolutely positioned
- **Note:** Uses `top: 6px; left: 6px` which accounts for card padding

### Issue 5: Button Width Calculation
- **Expected width:** `119px - 6px - 6px = 107px` (if absolutely positioned)
- **Actual width:** Unknown due to position conflict
- **Fix:** After fixing position, verify width is correct

---

## Recommended Fixes

1. **Fix button positioning:**
   ```css
   .i1-item-equip, .i1-item-use {
     position: absolute; /* Keep only this */
     bottom: 6px;
     left: 6px;
     right: 6px;
     /* Remove: position: relative; */
     padding: 8px 6px;
     /* ... rest of styles ... */
   }
   ```

2. **Add footer CSS (optional):**
   ```css
   .i1-item-footer {
     position: absolute;
     bottom: 6px;
     left: 6px;
     right: 6px;
     height: auto; /* Let button determine height */
   }
   ```
   Then make button `position: relative` and `width: 100%` to fill footer.

3. **Or simplify (recommended):**
   - Remove `.i1-item-footer` wrapper from HTML
   - Position button directly as absolute
   - This matches shop card approach

---

## Comparison: Shop vs Inventory Cards

| Aspect | Shop Cards | Inventory Cards |
|--------|-----------|-----------------|
| **Aspect Ratio** | `height: 0; padding-bottom: 100%` | `aspect-ratio: 1` |
| **Padding** | `0` | `12px` |
| **Layout** | Absolute positioning | Flexbox + Absolute mix |
| **Children Position** | `position: absolute` | `position: relative` (except quantity/button) |
| **Button Position** | In footer, absolute | Direct absolute (but conflicted) |
| **Content Area** | `147px × 147px` (no padding) | `119px × 119px` (with padding) |

---

## Summary

**Card Dimensions:** `147px × 147px` (outer), `119px × 119px` (inner content)

**Component Positions:**
- **Quantity:** Top-left (`6px, 6px` from inner), ~22px height
- **Header:** Flex child at top, ~80px height
- **Button:** Should be `6px` from bottom, but has position conflict

**Critical Issues:**
1. ⚠️ Button has `position: absolute` and `position: relative` conflict
2. Footer container has no CSS rules
3. Button positioning properties are being ignored

**Recommendation:** Fix button position conflict first, then verify layout. Consider simplifying to match shop card approach for consistency.

