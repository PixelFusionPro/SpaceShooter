# Shop Card Redesign Plan - No Scrolling

## Current Problems
1. Header area too small for content (icon + label + stats)
2. Stats section needs scrolling (max-height: 60px but only ~70px total available)
3. Content overflow issues
4. Inefficient use of space

## New Design Concept

### Layout Structure (Top to Bottom):
```
┌─────────────────────────┐
│ [Price Tag]             │  Top: 3px, Height: ~18px
├─────────────────────────┤
│                         │
│      [Icon]             │  Icon: 32px × 32px, centered
│                         │
│   [Item Name]           │  Label: 1 line, ~12px height
│                         │
│  [Stat 1] [Stat 2]      │  Stats: 2 columns, compact
│  [Stat 3]               │  Each stat: ~14px height
│                         │
├─────────────────────────┤
│   [Buy Button]          │  Footer: Height: 32px
└─────────────────────────┘
```

### Key Changes:
1. **Icon**: Reduce to 32px (from 36px)
2. **Label**: Single line, smaller font
3. **Stats**: Display in 2-column grid (more compact)
4. **Stats limit**: Show max 3 stats (already doing this)
5. **No scrolling**: All content fits in fixed height
6. **Tighter spacing**: Reduce all gaps and padding

### Space Calculation:
- Card height: ~147px (square)
- Price area: 3px top + 18px height = 21px
- Header area: 22px top to 34px bottom = 112px available
  - Icon: 32px
  - Gap: 3px
  - Label: 12px
  - Gap: 3px
  - Stats: 3 stats × 14px = 42px (2 columns = 2 rows)
  - Padding: 4px top + 4px bottom = 8px
  - Total: 32 + 3 + 12 + 3 + 42 + 8 = 100px ✓ Fits!
- Footer: 34px bottom + 32px height = 66px from top
- Total: 21 + 100 + 66 = 187px... Wait, that's too much!

### Revised Calculation:
- Card: 147px height
- Price: 3px + 16px = 19px
- Header: 20px top to 34px bottom = 93px available
  - Icon: 28px
  - Gap: 2px
  - Label: 11px
  - Gap: 2px
  - Stats (2-col grid): 2 rows × 13px = 26px
  - Padding: 3px top + 3px bottom = 6px
  - Total: 28 + 2 + 11 + 2 + 26 + 6 = 75px ✓
- Footer: 34px bottom + 30px height = 64px
- Total: 19 + 75 + 64 = 158px... Still too much!

### Final Optimized Layout:
- Card: 147px
- Price: 2px top + 14px = 16px
- Header: 18px top to 32px bottom = 97px available
  - Icon: 26px
  - Gap: 2px
  - Label: 10px
  - Gap: 2px
  - Stats grid: 2 rows × 12px = 24px
  - Padding: 2px top + 2px bottom = 4px
  - Total: 26 + 2 + 10 + 2 + 24 + 4 = 68px ✓
- Footer: 32px bottom + 28px height = 60px
- Total: 16 + 68 + 60 = 144px ✓ Fits in 147px!

## Implementation Plan:
1. Reduce icon to 26px
2. Reduce label font to 10px
3. Create 2-column stats grid
4. Reduce all spacing
5. Reduce footer/button height
6. Optimize price tag size

