/**
 * Test Data Script - English Vocabulary Learning
 *
 * Run this in the browser console to populate the app with sample vocabulary words
 * for testing the vocabulary learning application.
 */

const sampleVocabulary = [
  {
    id: crypto.randomUUID(),
    term: 'Eloquent',
    definition: 'Fluent or persuasive in speaking or writing; expressing yourself readily, clearly, and effectively',
    mastered: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: crypto.randomUUID(),
    term: 'Ephemeral',
    definition: 'Lasting for a very short time; transitory or short-lived',
    mastered: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: crypto.randomUUID(),
    term: 'Benevolent',
    definition: 'Well-meaning and kindly; showing or motivated by sympathy and understanding',
    mastered: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: crypto.randomUUID(),
    term: 'Meticulous',
    definition: 'Showing great attention to detail; very careful and precise',
    mastered: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: crypto.randomUUID(),
    term: 'Ubiquitous',
    definition: 'Present, appearing, or found everywhere; seemingly omnipresent',
    mastered: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: crypto.randomUUID(),
    term: 'Pragmatic',
    definition: 'Dealing with things sensibly and realistically; practical rather than idealistic',
    mastered: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: crypto.randomUUID(),
    term: 'Ambiguous',
    definition: 'Open to more than one interpretation; not having one obvious meaning',
    mastered: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: crypto.randomUUID(),
    term: 'Tenacious',
    definition: 'Tending to keep a firm hold; persistent in maintaining, adhering to, or seeking something valued',
    mastered: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: crypto.randomUUID(),
    term: 'Resilient',
    definition: 'Able to withstand or recover quickly from difficult conditions; adaptable and flexible',
    mastered: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: crypto.randomUUID(),
    term: 'Candid',
    definition: 'Truthful and straightforward; frank and sincere in expression',
    mastered: false,
    createdAt: new Date().toISOString(),
  },
];

const storageData = {
  version: '1.0',
  cards: sampleVocabulary,
  lastModified: new Date().toISOString(),
};

localStorage.setItem('flashcards-app-data', JSON.stringify(storageData));
console.log('✅ Added 10 vocabulary words to LocalStorage');
console.log('📚 Words: Eloquent, Ephemeral, Benevolent, Meticulous, Ubiquitous, Pragmatic, Ambiguous, Tenacious, Resilient, Candid');
console.log('🔄 Refresh the page to see them in the app');
