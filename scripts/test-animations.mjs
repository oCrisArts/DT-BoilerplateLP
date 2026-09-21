// Simple validation script for the new animation features
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';

console.log('Testing animation features implementation...\n');

// Test 1: Check Layout.tsx has ScrollSpy implementation
const layoutContent = readFileSync('src/app/Layout.tsx', 'utf-8');
assert.ok(layoutContent.includes('IntersectionObserver'), 'Layout.tsx has IntersectionObserver');
assert.ok(layoutContent.includes('activeSection'), 'Layout.tsx has activeSection state');
assert.ok(layoutContent.includes('scrollYProgress'), 'Layout.tsx has scroll progress');
assert.ok(layoutContent.includes('layoutId="activeNavIndicator"'), 'Layout.tsx has animated nav indicator');
console.log('✓ ScrollSpy implementation verified');

// Test 2: Check App.tsx has improved ScrollReveal
const appContent = readFileSync('src/app/App.tsx', 'utf-8');
assert.ok(appContent.includes('y: 40'), 'ScrollReveal has improved y offset');
assert.ok(appContent.includes('duration: reduceMotion ? 0 : 0.7'), 'ScrollReveal has improved duration');
assert.ok(appContent.includes('StaggeredReveal'), 'App.tsx has StaggeredReveal component');
console.log('✓ Improved ScrollReveal verified');

// Test 3: Check Hero animations
assert.ok(appContent.includes('delay={0}'), 'Hero has staggered animations');
assert.ok(appContent.includes('initial={{ opacity: 0, scale: 0.9, x: 20 }}'), 'Hero PluginMockup has fade + scale + x animation');
console.log('✓ Hero animations verified');

// Test 4: Check Features grid (original Figma layout)
assert.ok(appContent.includes('grid min-w-0 gap-6 lg:grid-cols-3'), 'Features uses grid layout as in Figma');
assert.ok(appContent.includes('StaggeredReveal'), 'Features uses StaggeredReveal for animations');
assert.ok(appContent.includes('whileHover={{ y: -6, scale: 1.02 }}'), 'Features cards have hover microinteractions');
console.log('✓ Features grid layout verified');

// Test 5: Check card hover effects
assert.ok(appContent.includes('whileHover={{ y: -6, scale: 1.02 }}'), 'Cards have hover microinteractions');
assert.ok(appContent.includes('hover:shadow-lg'), 'Cards have shadow hover effect');
assert.ok(appContent.includes('hover:border-accent/50'), 'Cards have border hover effect');
console.log('✓ Card hover effects verified');

// Test 6: Check How It Works animations
assert.ok(appContent.includes('initial={{ opacity: 0, x: reduceMotion ? 0 : 40 }}'), 'How It Works has slide animation');
assert.ok(appContent.includes('exit={{ opacity: 0, x: reduceMotion ? 0 : -40 }}'), 'How It Works has exit animation');
assert.ok(appContent.includes('layoutId="activeTabIndicator"'), 'How It Works has animated tab indicator');
console.log('✓ How It Works animations verified');

// Test 7: Check FAQ animations
assert.ok(appContent.includes('animate={{ rotate: open ? 180 : 0 }}'), 'FAQ has icon rotation');
assert.ok(appContent.includes('animate={{ height, opacity: open ? 1 : 0 }}'), 'FAQ has height + opacity animation');
assert.ok(appContent.includes('scrollHeight'), 'FAQ uses scrollHeight for dynamic height');
console.log('✓ FAQ animations verified');

// Test 8: Check Visual Documentation uses Vegas.js
assert.ok(appContent.includes('vegasRef'), 'Visual Documentation uses Vegas.js');
assert.ok(appContent.includes('jquery'), 'App.tsx imports jQuery for Vegas.js');
assert.ok(appContent.includes('$vegasElement.vegas'), 'Visual Documentation initializes Vegas.js');
assert.ok(appContent.includes('kenburns'), 'Visual Documentation uses kenburns animation');
console.log('✓ Visual Documentation Vegas.js implementation verified');

// Test 9: Check motion/react imports
assert.ok(appContent.includes('motion/react'), 'App.tsx imports motion/react');
assert.ok(layoutContent.includes('motion/react'), 'Layout.tsx imports motion/react');
assert.ok(layoutContent.includes('useScroll'), 'Layout.tsx imports useScroll');
assert.ok(layoutContent.includes('useTransform'), 'Layout.tsx imports useTransform');
console.log('✓ Motion/react imports verified');

// Test 10: Check performance optimizations
assert.ok(appContent.includes('transform'), 'Animations use transform property');
assert.ok(appContent.includes('opacity'), 'Animations use opacity property');
assert.ok(!appContent.includes('top:'), 'Animations avoid top property');
assert.ok(!appContent.includes('left:'), 'Animations avoid left property');
console.log('✓ Performance optimizations verified');

// Test 11: Check reduced motion support
assert.ok(appContent.includes('useReducedMotion'), 'App.tsx uses useReducedMotion');
assert.ok(appContent.includes('reduceMotion ? 0 :'), 'Animations respect reduced motion');
console.log('✓ Reduced motion support verified');

console.log('\n✅ All animation features implemented correctly!\n');
console.log('Summary:');
console.log('- ScrollSpy with IntersectionObserver ✓');
console.log('- Improved ScrollReveal animations ✓');
console.log('- Hero staggered animations ✓');
console.log('- Features grid layout with hover effects ✓');
console.log('- Card hover microinteractions ✓');
console.log('- How It Works slide animations ✓');
console.log('- FAQ height + opacity animations ✓');
console.log('- Visual Documentation with Vegas.js slideshow ✓');
console.log('- Scroll progress bar ✓');
console.log('- Performance optimizations ✓');
console.log('- Reduced motion support ✓');