# Card Positioning Debug Analysis

## Current Card Structure

### Card Container (.s1-item-card)
- `position: relative` - Creates positioning context
- `width: 100%` - Takes full grid cell width
- `height: 0` + `padding-bottom: 100%` - Creates square aspect ratio
- `border: 2px solid` - Border included in box-sizing
- `box-sizing: border-box` - Border included in total size
- `padding: 0` - No padding

### Positioning Context
- All direct children: `position: absolute` (via `.s1-item-card > *`)
- Children positioned relative to card's **padding box** (since padding is 0, this is the border box)

## Current Positioning Values

### Price Tag
- `top: 4px, left: 4px`
- Positioned from card's top-left corner (accounting for border)

### Header Area
- `top: 24px` - Below price tag area
- `left: 4px, right: 4px` - 4px margins from edges
- `bottom: 42px` - Above footer area
- **Available height**: Card height - 24px - 42px = Card height - 66px

### Footer Area  
- `bottom: 4px` - 4px from bottom
- `left: 4px, right: 4px` - 4px margins from edges
- **Width**: Auto-calculated from left/right (should be: Card width - 8px)
- **Height**: 36px

## Issues Identified

### 1. Footer Width Calculation
- Footer uses `left: 4px; right: 4px` which auto-calculates width
- Footer also had `width: 100%` which conflicts
- **FIX**: Removed explicit width, let left/right calculate it

### 2. Button Height
- Button had `height: 100%` + `min-height: 36px`
- Footer height is 36px
- **FIX**: Changed to explicit `height: 36px`

### 3. Stats Visibility
- Stats have `display: flex !important` and `visibility: visible !important`
- Header has `overflow-x: hidden` which might clip
- **FIX**: Changed header to `overflow-x: hidden` (was `overflow: hidden`)

### 4. Header Area Size
- Available: Card height - 66px
- For 147px card: 147 - 66 = 81px available
- Content needs: Icon (36px) + Gap (4px) + Label (~13px) + Gap (4px) + Stats (up to 60px) = ~117px
- **ISSUE**: Not enough space!

## Recommended Final Fixes

1. Reduce header top/bottom margins
2. Increase available header height
3. Ensure footer width is correct (no explicit width when using left/right)
4. Verify stats are rendering in HTML

