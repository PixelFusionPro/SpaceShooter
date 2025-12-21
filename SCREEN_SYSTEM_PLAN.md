# 🎮 Screen System Plan - Zombie Shooter Defense

## Current Issues Identified

### 1. **Main Menu Not Visible**
   - `#mainMenu` exists but may have z-index/positioning issues
   - Menu is inside `#gameContainer` (360x600px) but needs full viewport coverage
   - No proper initialization/visibility management

### 2. **No Pause Screen**
   - Pause button exists but no visual pause menu
   - Game just stops when paused - no UI feedback
   - No way to return to main menu from pause

### 3. **Basic Game Over Screen**
   - Very minimal design (just text and button)
   - No stats display (score, wave, coins earned)
   - Poor visual feedback

### 4. **No Screen State Management**
   - Screens managed independently
   - No centralized state system
   - Potential z-index conflicts

---

## Screen System Architecture

### Screen States
```
1. MAIN_MENU      - Initial start screen
2. GAMEPLAY       - Active game running
3. PAUSED         - Game paused overlay
4. GAME_OVER      - Game over screen
5. SHOP           - Shop overlay (can appear from menu or paused)
6. INVENTORY      - Inventory overlay (can appear from menu or paused)
```

### Z-Index Layering (Bottom to Top)
```
z-index: 1  - Canvas background
z-index: 2  - HUD elements
z-index: 3  - Game over overlay
z-index: 4  - Wave intro/recap
z-index: 5  - Main menu
z-index: 6  - Pause screen
z-index: 20 - Shop/Inventory overlays
```

---

## Screen Specifications

### 1. MAIN MENU (Start Screen)

**Purpose**: First screen player sees, entry point to game

**Layout**:
```
┌─────────────────────────┐
│  🧟 ZOMBIE SHOOTER      │
│     DEFENSE             │
│                         │
│  🏆 Best Score: 0       │
│  💰 Coins: 0            │
│                         │
│  [START GAME]           │
│                         │
│  [SHOP]     [INVENTORY] │
└─────────────────────────┘
```

**Elements**:
- Game title with zombie emoji
- Best score display (from localStorage)
- Coins display (from localStorage)
- "Start Game" button (primary action)
- "Shop" button (opens shop overlay)
- "Inventory" button (opens inventory overlay)

**Styling**:
- Full viewport overlay (fixed positioning)
- Dark background with subtle zombie theme
- Centered content
- Modern button design matching game aesthetic
- Smooth animations on button hover

**Behavior**:
- Visible on page load
- Hidden when game starts
- Can return from game over or pause

---

### 2. GAMEPLAY SCREEN

**Purpose**: Active game state, player playing

**Layout**:
- Canvas visible (game world)
- HUD overlay (top of screen)
- Pause button (bottom left)

**Behavior**:
- Main menu hidden
- All overlays hidden (except HUD)
- Pause button visible
- Game loop running

---

### 3. PAUSE SCREEN

**Purpose**: Game paused, player can resume or quit

**Layout**:
```
┌─────────────────────────┐
│                         │
│      ⏸️ PAUSED          │
│                         │
│   Wave: 3               │
│   Score: 150            │
│   Health: 75/100        │
│                         │
│   [RESUME]              │
│   [MAIN MENU]           │
│   [SHOP]  [INVENTORY]   │
└─────────────────────────┘
```

**Elements**:
- "PAUSED" title with pause icon
- Current game stats:
  - Current wave
  - Current score
  - Current health
- "Resume" button (returns to gameplay)
- "Main Menu" button (ends game, returns to menu)
- "Shop" button (opens shop overlay)
- "Inventory" button (opens inventory overlay)

**Styling**:
- Semi-transparent dark overlay (rgba(0,0,0,0.85))
- Centered modal with rounded corners
- Blurred background effect
- Modern button design

**Behavior**:
- Overlays gameplay (doesn't hide it, just dims)
- Blocks all game input
- Can access shop/inventory without ending game
- Resume continues from where player left off

---

### 4. GAME OVER SCREEN

**Purpose**: Display results after player dies

**Layout**:
```
┌─────────────────────────┐
│    💀 GAME OVER 💀      │
│                         │
│   Final Score: 250      │
│   Best Score: 300 ⭐    │
│   Wave Reached: 5       │
│   Zombies Killed: 45    │
│   Coins Earned: +15     │
│                         │
│   [PLAY AGAIN]          │
│   [MAIN MENU]           │
└─────────────────────────┘
```

**Elements**:
- "GAME OVER" title with skull emoji
- Final stats:
  - Final score
  - Best score (with star if new record)
  - Wave reached
  - Zombies killed
  - Coins earned this run
- "Play Again" button (starts new game immediately)
- "Main Menu" button (returns to main menu)

**Styling**:
- Dark overlay (rgba(0,0,0,0.9))
- Centered modal with stats cards
- Animated appearance (slide in from top)
- Highlighted new record if achieved
- Modern, readable stats layout

**Behavior**:
- Appears when player health <= 0
- Calculates and displays final stats
- Updates best score if needed
- Saves coins to localStorage
- Play Again starts fresh game
- Main Menu returns to start screen

---

## Implementation Plan

### Phase 1: Create Screen Manager
- Create `js/screen-manager.js`
- Handle screen state transitions
- Manage visibility of all screens
- Ensure proper z-index management

### Phase 2: Redesign Main Menu
- Update HTML structure
- Create modern CSS styling
- Add proper initialization
- Ensure visibility on page load

### Phase 3: Create Pause Screen
- Add pause screen HTML
- Create pause screen CSS
- Integrate with pause button/key
- Add resume/main menu functionality

### Phase 4: Enhance Game Over Screen
- Redesign HTML layout
- Add stats display
- Create modern CSS styling
- Add animations
- Calculate and display final stats

### Phase 5: Integration
- Update `game.js` to use screen manager
- Update `controls.js` pause functionality
- Ensure all buttons work correctly
- Test all screen transitions

---

## Technical Details

### Screen Manager Class Structure
```javascript
class ScreenManager {
  constructor() {
    this.currentScreen = 'MAIN_MENU';
    this.screens = {
      MAIN_MENU: '#mainMenu',
      GAMEPLAY: '#gameContainer',
      PAUSED: '#pauseScreen',
      GAME_OVER: '#gameOverScreen'
    };
  }
  
  showScreen(screenName) { ... }
  hideScreen(screenName) { ... }
  showOverlay(overlayName) { ... }
  hideOverlay(overlayName) { ... }
}
```

### Button Actions

**Main Menu**:
- Start Game → `screenManager.showScreen('GAMEPLAY')` + `startGame()`
- Shop → `openShop()` (overlay)
- Inventory → `openInventory()` (overlay)

**Pause Screen**:
- Resume → `resumeGame()`
- Main Menu → `screenManager.showScreen('MAIN_MENU')` + `endGame()`
- Shop → `openShop()` (overlay)
- Inventory → `openInventory()` (overlay)

**Game Over Screen**:
- Play Again → `screenManager.showScreen('GAMEPLAY')` + `startGame()`
- Main Menu → `screenManager.showScreen('MAIN_MENU')` + cleanup

---

## CSS Classes Needed

### Main Menu
- `.main-menu` - Container
- `.main-menu-title` - Game title
- `.main-menu-stats` - Stats section
- `.main-menu-buttons` - Button container
- `.btn-primary` - Primary button (Start Game)
- `.btn-secondary` - Secondary button (Shop, Inventory)

### Pause Screen
- `.pause-screen` - Overlay
- `.pause-modal` - Modal container
- `.pause-stats` - Stats display
- `.pause-buttons` - Button container

### Game Over Screen
- `.game-over-screen` - Overlay
- `.game-over-modal` - Modal container
- `.game-over-stats` - Stats cards
- `.stat-card` - Individual stat card
- `.new-record` - Highlight for new record

---

## File Changes Required

1. **index.html**
   - Restructure main menu
   - Add pause screen HTML
   - Redesign game over screen HTML

2. **css/game.css**
   - Add main menu styles
   - Add pause screen styles
   - Enhance game over screen styles
   - Add screen transition animations

3. **js/screen-manager.js** (NEW)
   - Screen state management
   - Visibility control
   - Transition handling

4. **js/game.js**
   - Integrate screen manager
   - Update game over logic
   - Handle screen transitions

5. **js/controls.js**
   - Update pause to show pause screen
   - Handle pause screen input

6. **index.html** (script order)
   - Include screen-manager.js before game.js

---

## Testing Checklist

- [ ] Main menu visible on page load
- [ ] Start Game button works
- [ ] Shop button opens shop overlay
- [ ] Inventory button opens inventory overlay
- [ ] Pause button shows pause screen
- [ ] Pause key (P) shows pause screen
- [ ] Resume button continues game
- [ ] Main Menu from pause returns to menu
- [ ] Game over screen appears on death
- [ ] Game over shows correct stats
- [ ] Play Again starts new game
- [ ] Main Menu from game over works
- [ ] All screen transitions smooth
- [ ] No z-index conflicts
- [ ] Mobile responsive

---

## Visual Design Principles

1. **Consistency**: All screens share similar design language
2. **Readability**: Clear text, good contrast
3. **Modern UI**: Rounded corners, shadows, gradients
4. **Smooth Transitions**: Fade in/out animations
5. **Mobile First**: Touch-friendly buttons, responsive layout
6. **Game Theme**: Dark, zombie-apocalypse aesthetic

---

## Next Steps

1. Review this plan
2. Implement screen manager
3. Redesign main menu
4. Create pause screen
5. Enhance game over screen
6. Test all transitions
7. Polish animations and styling
