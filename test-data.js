/**
 * Test Data Script
 *
 * Run this in the browser console to populate the app with sample flashcards
 * for testing Phase 3 (User Story 1 - Study Existing Cards)
 */

const sampleCards = [
  {
    id: crypto.randomUUID(),
    term: 'React',
    definition: 'A JavaScript library for building user interfaces with component-based architecture',
    mastered: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: crypto.randomUUID(),
    term: 'TypeScript',
    definition: 'A strongly typed programming language that builds on JavaScript',
    mastered: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: crypto.randomUUID(),
    term: 'Context API',
    definition: 'React feature for sharing state across components without prop drilling',
    mastered: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: crypto.randomUUID(),
    term: 'LocalStorage',
    definition: 'Browser API for storing key-value pairs persistently with up to 5MB capacity',
    mastered: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: crypto.randomUUID(),
    term: 'CSS 3D Transforms',
    definition: 'CSS properties that enable 3D transformations like rotateY and perspective',
    mastered: true,
    createdAt: new Date().toISOString(),
  },
];

const storageData = {
  version: '1.0',
  cards: sampleCards,
  lastModified: new Date().toISOString(),
};

localStorage.setItem('flashcards-app-data', JSON.stringify(storageData));
console.log('✅ Added 5 sample flashcards to LocalStorage');
console.log('🔄 Refresh the page to see them in the app');
