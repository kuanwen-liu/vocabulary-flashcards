/**
 * Test Data Generator - Create 1000 Vocabulary Cards
 *
 * Usage: Copy and paste the output into browser console
 * This tests application performance with a large dataset
 */

// Sample vocabulary templates for generating test data
const vocabularyPrefixes = [
  'Academic', 'Beautiful', 'Curious', 'Delightful', 'Elegant',
  'Fabulous', 'Graceful', 'Harmonious', 'Innovative', 'Joyful',
  'Knowledge', 'Luminous', 'Magnificent', 'Notable', 'Outstanding',
  'Persistent', 'Quantum', 'Remarkable', 'Spectacular', 'Tremendous',
  'Unique', 'Vibrant', 'Wonderful', 'Xenial', 'Youthful', 'Zealous'
];

const vocabularySuffixes = [
  'Action', 'Behavior', 'Concept', 'Design', 'Element',
  'Feature', 'Growth', 'Harmony', 'Idea', 'Journey',
  'Knowledge', 'Learning', 'Method', 'Nature', 'Option',
  'Pattern', 'Quality', 'Resource', 'Strategy', 'Technique',
  'Understanding', 'Value', 'Wisdom', 'X-factor', 'Yield', 'Zenith'
];

const definitionTemplates = [
  'A fundamental concept in learning',
  'An essential element of understanding',
  'A critical component of knowledge',
  'An important aspect of education',
  'A key principle in development',
  'A vital factor in progress',
  'A significant feature of growth',
  'A notable characteristic of success'
];

const chineseTranslations = [
  '重要的', '基本的', '關鍵的', '必要的', '顯著的',
  '卓越的', '優秀的', '傑出的', '獨特的', '有價值的',
  '有意義的', '有影響力的', '有效的', '實用的', '創新的',
  '進步的', '發展的', '成長的', '學習的', '理解的'
];

// Generate 1000 vocabulary cards
function generateTestData() {
  const cards = [];

  for (let i = 0; i < 1000; i++) {
    const prefixIndex = i % vocabularyPrefixes.length;
    const suffixIndex = Math.floor(i / vocabularyPrefixes.length) % vocabularySuffixes.length;
    const defIndex = i % definitionTemplates.length;
    const cnIndex = i % chineseTranslations.length;

    const term = `${vocabularyPrefixes[prefixIndex]}${vocabularySuffixes[suffixIndex]}${i + 1}`;
    const definition = `${definitionTemplates[defIndex]} (Entry ${i + 1}); ${chineseTranslations[cnIndex]}`;
    const mastered = i % 3 === 0; // Every 3rd card is mastered

    cards.push({
      id: crypto.randomUUID(),
      term,
      definition,
      mastered,
      createdAt: new Date(Date.now() - (1000 - i) * 60000).toISOString() // Spread over time
    });
  }

  return cards;
}

// Create storage schema
const testData = {
  version: '1.0',
  cards: generateTestData(),
  lastModified: new Date().toISOString()
};

console.log('Generated 1000 vocabulary cards');
console.log('Mastered:', testData.cards.filter(c => c.mastered).length);
console.log('Needs Review:', testData.cards.filter(c => !c.mastered).length);
console.log('\n=== Copy and paste this into browser console: ===\n');
console.log(`localStorage.setItem('flashcards-app-data', '${JSON.stringify(testData)}');`);
console.log(`location.reload();`);
console.log('\n=== Or use this to clear and start fresh: ===\n');
console.log(`localStorage.removeItem('flashcards-app-data');`);
console.log(`location.reload();`);
