# Shop Card Size Calculation & Positioning Issues

## Container Chain Analysis

### 1. Shop Container (.s1-container)
- Width: `100%` of overlay (360px max)
- Height: `100%` of overlay (600px max)
- Padding: `15px` all sides
- Border: `2px solid` (included in box-sizing)
- **Available content width**: 360px - (15px × 2) - (2px × 2) = **326px**
- **Available content height**: 600px - (15px × 2) - (2px × 2) = **566px**

### 2. Shop Items Grid (.s1-items)
- Display: `grid`
- Columns: `repeat(2, 1fr)` - 2 equal columns
- Gap: `12px` between cards
- Padding: `10px` all sides
- **Available width for cards**: 326px - (10px × 2) - 12px = **294px**
- **Card width**: 294px ÷ 2 = **147px per card**

### 3. Shop Item Card (.s1-item-card)
- Width: `100%` of grid cell = **147px**
- Border: `2px solid` (included in box-sizing)
- **Actual content area**: 147px - (2px × 2) = **143px**
- Height: `0` + `padding-bottom: 100%` = **147px** (square)
- **Actual content height**: 147px - (2px × 2) = **143px**

## CRITICAL ISSUE: Border Affects Content Area

The card has `border: 2px` with `box-sizing: border-box`, which means:
- Card outer size: 147px × 147px
- Card inner content area: 143px × 143px
- **All absolute positioned children are positioned relative to the 143px × 143px area**

## Positioning Breakdown (within 143px × 143px content area)

### Price Tag
- Position: `top: 8px, left: 8px`
- Max width: `calc(100% - 24px)` = 143px - 24px = **119px**

### Header Area
- Position: `top: 28px, left: 8px, right: 8px, bottom: 46px`
- Width: 143px - 8px - 8px = **127px**
- Height: 143px - 28px - 46px = **69px**
- Internal padding: `4px 2px`
- **Actual content width**: 127px - (2px × 2) = **123px**
- **Actual content height**: 69px - (4px × 2) = **61px**

### Footer Area
- Position: `bottom: 8px, left: 8px, right: 8px`
- Width: 143px - 8px - 8px = **127px**
- Height: `38px`

## PROBLEMS IDENTIFIED

### 1. **Header Height Too Small**
- Available: 61px
- Icon: 48px
- Gap: 6px
- Label: ~14-24px
- Gap: 6px
- Stats: up to 70px (but only 61px available!)
- **Total needed**: 48 + 6 + 20 + 6 + 70 = **150px** (but only 61px available!)

### 2. **Duplicate Header Rule**
- `.s1-item-card > .s1-item-header` (absolute positioned, gap: 6px)
- `.s1-item-header` (standalone, gap: 4px, width/height: 100%)
- The standalone rule might be applying and conflicting!

### 3. **Price Tag Positioning**
- Price tag at `top: 8px` but header starts at `top: 28px`
- Price tag height: ~22px (12px font + 10px padding)
- Gap: 28px - 8px - 22px = **-2px** (overlap or very tight!)

### 4. **Border Not Accounted For**
- All positioning assumes full card size
- But border reduces actual content area by 4px (2px × 2)
- Absolute positioning is relative to padding box, not border box!

## SOLUTION NEEDED

1. Account for border in positioning calculations
2. Increase header area height
3. Remove or fix duplicate header rule
4. Adjust price tag/header spacing
5. Reduce stats max-height to fit available space

