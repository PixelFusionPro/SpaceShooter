// Quick validation script - run in browser console
// Copy this into browser console after page loads to verify all elements

const requiredElements = {
  // Core
  gameContainer: 'gameContainer',
  game: 'game',
  overlay: 'overlay',
  damageFlash: 'damageFlash',
  mainMenu: 'mainMenu',
  loadingScreen: 'loadingScreen',
  achievementNotification: 'achievementNotification',
  
  // Wave
  waveIntro: 'waveIntro',
  waveNumber: 'waveNumber',
  waveRecap: 'waveRecap',
  
  // HUD Core
  hud: 'hud',
  health: 'health',
  healthfill: 'healthfill',
  healthbar: 'healthbar',
  wave: 'wave',
  score: 'score',
  coinCount: 'coinCount',
  bestScore: 'bestScore',
  
  // Rank
  rank: 'rank',
  rankCard: 'rankCard',
  rankIcon: 'rankIcon',
  
  // Powerup
  powerupIndicator: 'powerupIndicator',
  powerupIcon: 'powerupIcon',
  activePowerup: 'activePowerup',
  powerupTimer: 'powerupTimer',
  
  // Combo
  comboDisplay: 'comboDisplay',
  comboCount: 'comboCount',
  
  // Menu
  menuBest: 'menuBest'
};

console.log('🔍 Validating Game Elements...\n');

let allFound = true;
const missing = [];

for (const [name, id] of Object.entries(requiredElements)) {
  const element = document.getElementById(id);
  if (element) {
    console.log(`✅ ${name} (#${id}) - Found`);
  } else {
    console.error(`❌ ${name} (#${id}) - MISSING!`);
    allFound = false;
    missing.push(id);
  }
}

console.log('\n' + '='.repeat(50));

if (allFound) {
  console.log('✅ ALL ELEMENTS FOUND - Game should work!');
} else {
  console.error(`❌ ${missing.length} ELEMENT(S) MISSING:`);
  missing.forEach(id => console.error(`   - #${id}`));
  console.error('\n⚠️ Game may not work correctly!');
}

console.log('\n📊 Additional Checks:');
console.log(`   HealthFill class fallback: ${document.querySelector('.health-fill') ? '✅ Found' : '❌ Missing'}`);
console.log(`   Game instance: ${typeof Game !== 'undefined' ? '✅ Exists' : '❌ Not created'}`);

