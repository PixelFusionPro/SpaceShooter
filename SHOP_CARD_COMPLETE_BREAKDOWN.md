# Shop Item Card - Complete Component Breakdown

## HTML Structure (from `js/shop-ui.js`)

```html
<div class="s1-item-card">
  <div class="s1-item-header">
    <div class="s1-item-icon">${svgIcon}</div>
    <div class="s1-item-label">${item.name}</div>
    <div class="s1-item-stats">
      <div class="s1-item-stat">...</div>
      <div class="s1-item-stat">...</div>
    </div>
  </div>
  <div class="s1-item-price">💰 ${item.price}</div>
  <div class="s1-item-footer">
    <button class="s1-item-buy">Buy</button>
  </div>
</div>
```

---

## Container Hierarchy & Dimensions

### 1. `.s1-container` (Shop Container)
- **Width:** `max-width: 360px` (desktop), `calc(100vw - 20px)` (mobile)
- **Height:** `max-height: 600px`
- **Padding:** `15px` (all sides)
- **Box-sizing:** `border-box`
- **Border:** `2px solid rgba(255, 255, 255, 0.3)`
- **Effective inner width (desktop):** `360px - 15px*2 - 2px*2 = 326px`

### 2. `.s1-items` (Grid Container)
- **Layout:** `display: grid`
- **Columns:** `grid-template-columns: repeat(2, 1fr)` (2 equal columns)
- **Gap:** `12px` (between cards)
- **Padding:** `10px` (all sides)
- **Box-sizing:** `border-box`
- **Effective width for cards:** `326px - 10px*2 = 306px`
- **Available width per column:** `(306px - 12px) / 2 = 147px`

### 3. `.s1-item-card` (Individual Card)
- **Position:** `position: relative` (creates positioning context)
- **Width:** `width: 100%` (fills its grid column = 147px)
- **Height:** `height: 0; padding-bottom: 100%` (creates square aspect ratio)
  - **Actual height:** `147px` (same as width)
- **Border:** `2px solid rgba(255, 255, 255, 0.3)` (adds 4px total to dimensions)
- **Border-radius:** `10px`
- **Padding:** `0` (no padding on card itself)
- **Box-sizing:** `border-box` (border included in 147px)
- **Overflow:** `hidden` (clips content outside)
- **Actual content area:** `147px × 147px` (border is inside due to box-sizing)

---

## Absolute Positioned Children

All direct children of `.s1-item-card` are `position: absolute` (from `.s1-item-card > *`).

### 4. `.s1-item-price` (Price Badge)
- **Position:** `position: absolute` (explicit, overrides general rule)
- **Top:** `2px` (from top edge of card)
- **Left:** `2px` (from left edge of card)
- **Z-index:** `10` (above other content)
- **Font-size:** `9px`
- **Padding:** `2px 6px` (vertical: 2px top/bottom, horizontal: 6px left/right)
- **Border-radius:** `4px`
- **Line-height:** Default (~1.2-1.4 × font-size)
- **Estimated height:** `9px × 1.2 + 2px × 2 = ~14.8px`
- **Max-width:** `calc(100% - 12px)` = `calc(147px - 12px)` = `135px`
- **Overflow:** `hidden; text-overflow: ellipsis; white-space: nowrap`
- **Box-sizing:** `border-box`

**Space reserved:** Top-left corner, ~15px height, ~135px max width

---

### 5. `.s1-item-card > .s1-item-header` (Content Container)
- **Position:** `position: absolute` (from `.s1-item-card > *`)
- **Top:** `18px` (from top edge of card)
- **Left:** `3px` (from left edge of card)
- **Right:** `3px` (from right edge of card)
- **Bottom:** `30px` (from bottom edge of card)
- **Layout:** `display: flex; flex-direction: column; align-items: center; justify-content: flex-start`
- **Gap:** `2px` (vertical spacing between children)
- **Padding:** `2px` (all sides)
- **Box-sizing:** `border-box`
- **Overflow:** `hidden` (clips content)
- **Z-index:** `2` (from `.s1-item-card > *`)

**Calculated dimensions:**
- **Width:** `147px - 3px - 3px = 141px`
- **Height:** `147px - 18px - 30px = 99px`
- **Effective content width:** `141px - 2px*2 = 137px`
- **Effective content height:** `99px - 2px*2 = 95px`

**Content inside header:**
1. Icon (28px height)
2. Gap (2px)
3. Label (~10px height)
4. Gap (2px)
5. Stats grid (max 24px height)

**Total content height needed:** `28px + 2px + 10px + 2px + 24px = 66px`
**Available height:** `95px`
**Status:** ✅ Fits with 29px to spare

---

### 6. `.s1-item-icon` (Icon)
- **Width:** `28px`
- **Height:** `28px`
- **Font-size:** `20px` (for emoji/SVG)
- **Display:** `flex; align-items: center; justify-content: center`
- **Flex-shrink:** `0` (won't shrink)
- **Box-sizing:** `border-box`

**Space used:** `28px height`

---

### 7. `.s1-item-label` (Item Name)
- **Font-size:** `9px`
- **Line-height:** `1.1`
- **Max-height:** `10px` (limits to ~1 line)
- **Width:** `100%` (of parent header = 137px)
- **Padding:** `0 2px` (horizontal only)
- **Overflow:** `hidden; text-overflow: ellipsis; white-space: nowrap`
- **Flex-shrink:** `0`
- **Box-sizing:** `border-box`

**Space used:** `10px height` (max)

---

### 8. `.s1-item-stats` (Stats Grid Container)
- **Display:** `grid !important`
- **Grid-template-columns:** `repeat(2, 1fr)` (2 equal columns)
- **Gap:** `2px` (between grid items)
- **Width:** `100%` (of parent header = 137px)
- **Max-height:** `24px`
- **Min-height:** `0`
- **Padding:** `0`
- **Margin-top:** `0`
- **Overflow:** `hidden`
- **Flex-shrink:** `1` (can shrink if needed)
- **Box-sizing:** `border-box`
- **Align-content:** `start`

**Grid layout:**
- **Column width:** `(137px - 2px) / 2 = 67.5px` per column
- **Max rows:** `2` (to fit in 24px height)

**Space used:** `24px height` (max)

---

### 9. `.s1-item-stat` (Individual Stat)
- **Display:** `flex; justify-content: space-between; align-items: center`
- **Font-size:** `8px`
- **Line-height:** `1`
- **Height:** `11px` (fixed)
- **Padding:** `1px 2px` (vertical: 1px, horizontal: 2px)
- **Border-radius:** `2px`
- **Flex-shrink:** `0`
- **Min-width:** `0`
- **Overflow:** `hidden; text-overflow: ellipsis; white-space: nowrap`
- **Box-sizing:** `border-box`

**Grid calculation:**
- **2 columns × 2 rows = 4 stat items max**
- **Total height:** `2 rows × 11px + 1 gap × 2px = 24px` ✅

**Space used:** `11px height` per stat, `24px` total for 2 rows

---

### 10. `.s1-item-card > .s1-item-footer` (Footer Container)
- **Position:** `position: absolute` (from `.s1-item-card > *`)
- **Bottom:** `2px` (from bottom edge of card)
- **Left:** `3px` (from left edge of card)
- **Right:** `3px` (from right edge of card)
- **Height:** `28px` (fixed)
- **Z-index:** `10` (from `.s1-item-card > .s1-item-footer`, overrides general `z-index: 2`)
- **Box-sizing:** `border-box`
- **Overflow:** `hidden`
- **Position:** `relative` (from `.s1-item-footer` standalone rule - **CONFLICT!**)

**Calculated dimensions:**
- **Width:** `147px - 3px - 3px = 141px`
- **Height:** `28px`
- **Position:** `2px` from bottom, `3px` from left/right

**⚠️ CONFLICT IDENTIFIED:**
- `.s1-item-card > .s1-item-footer` has `position: absolute` (implicit from `.s1-item-card > *`)
- `.s1-item-footer` standalone rule has `position: relative`
- **Resolution:** More specific selector (`.s1-item-card > .s1-item-footer`) should win, but having both is redundant and can cause issues.

---

### 11. `.s1-item-buy` (Buy Button)
- **Width:** `100%` (of parent footer = 141px)
- **Height:** `28px` (matches parent footer)
- **Padding:** `0`
- **Font-size:** `9px`
- **Border-radius:** `4px`
- **Border:** `none`
- **Display:** `flex; align-items: center; justify-content: center`
- **Box-sizing:** `border-box`
- **Position:** `relative` (for ::before pseudo-element)
- **Overflow:** `hidden`
- **White-space:** `nowrap; text-overflow: ellipsis`

**Dimensions:**
- **Width:** `141px`
- **Height:** `28px`

**Positioning:**
- Button fills the footer container completely
- Footer is positioned `2px` from bottom, `3px` from sides

---

## Complete Vertical Space Calculation (147px × 147px card)

### Top to Bottom Breakdown:

1. **Price badge area:**
   - Top: `0px` (card edge)
   - Price top: `2px`
   - Price height: `~15px`
   - **Reserved:** `0px - 17px`

2. **Header area:**
   - Header top: `18px` (from card top)
   - Header bottom: `30px` (from card bottom)
   - **Available height:** `147px - 18px - 30px = 99px`
   - **Content height:** `99px - 2px*2 (padding) = 95px`
   - **Used:** `28px (icon) + 2px (gap) + 10px (label) + 2px (gap) + 24px (stats) = 66px`
   - **Remaining:** `95px - 66px = 29px` ✅

3. **Footer area:**
   - Footer bottom: `2px` (from card bottom)
   - Footer height: `28px`
   - **Reserved:** `2px - 30px` from bottom

### Verification:
- **Total reserved:** `18px (header top) + 30px (header bottom) = 48px`
- **Header content:** `66px`
- **Footer:** `28px + 2px = 30px`
- **Total used:** `48px + 66px = 114px` (but header is 99px tall, so content fits)
- **Card height:** `147px`
- **Remaining space:** `147px - 18px (header top) - 99px (header) - 30px (footer) = 0px` ✅

**Wait, this doesn't add up! Let me recalculate:**

- Card height: `147px`
- Header top: `18px`
- Header bottom: `30px`
- Header height: `147px - 18px - 30px = 99px` ✅
- Footer bottom: `2px`
- Footer height: `28px`
- Footer top edge: `147px - 2px - 28px = 117px` from card top

**Potential overlap check:**
- Header bottom edge: `18px + 99px = 117px` from card top
- Footer top edge: `117px` from card top
- **⚠️ HEADER AND FOOTER ARE TOUCHING (no gap)!**

This means:
- Header ends at `117px`
- Footer starts at `117px`
- There's no visual gap between them, but they shouldn't overlap

---

## Issues Identified

### Issue 1: Footer Position Conflict
- `.s1-item-footer` has `position: relative` (standalone rule)
- `.s1-item-card > .s1-item-footer` should be `position: absolute` (from `.s1-item-card > *`)
- **Fix:** Remove `position: relative` from `.s1-item-footer` standalone rule, or make `.s1-item-card > .s1-item-footer` explicitly `position: absolute`

### Issue 2: No Gap Between Header and Footer
- Header bottom: `30px` from card bottom = `117px` from top
- Footer top: `2px` from card bottom = `117px` from top (with 28px height)
- **Result:** Header and footer are touching with no gap
- **Potential fix:** Increase header `bottom` to `32px` or `34px` to create a small gap

### Issue 3: Button Width Calculation
- Footer width: `147px - 3px - 3px = 141px`
- Button width: `100%` of footer = `141px`
- **Status:** ✅ Correct, but verify no border/padding issues

### Issue 4: Z-index Layering
- Price: `z-index: 10`
- Footer: `z-index: 10`
- Header: `z-index: 2` (from `.s1-item-card > *`)
- **Status:** ✅ Price and footer are above header, which is correct

---

## Recommended Fixes

1. **Explicitly set footer position:**
   ```css
   .s1-item-card > .s1-item-footer {
     position: absolute; /* Explicit */
     bottom: 2px;
     left: 3px;
     right: 3px;
     height: 28px;
     z-index: 10;
   }
   ```

2. **Remove conflicting position from standalone rule:**
   ```css
   .s1-item-footer {
     height: 28px;
     box-sizing: border-box;
     overflow: hidden;
     /* Remove: position: relative; */
   }
   ```

3. **Add small gap between header and footer:**
   ```css
   .s1-item-card > .s1-item-header {
     bottom: 32px; /* Changed from 30px to create 2px gap */
   }
   ```

4. **Verify button fills footer correctly:**
   - Button: `width: 100%; height: 28px` ✅
   - Footer: `height: 28px; width: 141px` ✅
   - **Status:** Should be correct, but verify no margin/padding on button

---

## Mobile Responsive Considerations

### `@media (max-width: 360px)`
- `.s1-items` grid: `grid-template-columns: repeat(auto-fill, minmax(min(50px, 22%), 1fr))`
- Gap: `6px`
- **Note:** Cards may be smaller on mobile, but aspect ratio is maintained

---

## Summary

**Card Dimensions:** `147px × 147px` (square)

**Component Positions:**
- **Price:** Top-left (`2px, 2px`), ~15px height
- **Header:** `18px` from top, `30px` from bottom, `3px` from sides
- **Footer:** `2px` from bottom, `3px` from sides, `28px` height
- **Button:** Fills footer (`141px × 28px`)

**Potential Issues:**
1. Footer `position: relative` conflict
2. No gap between header and footer (touching at 117px)
3. Need to verify button has no unexpected margins

**Recommendation:** Fix footer positioning explicitly and add a small gap between header and footer for visual clarity.

