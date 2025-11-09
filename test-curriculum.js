import curriculum from './src/content/curriculum/curriculum-index.js';

console.log('K-2 lessons:', curriculum.getTotalLessons('K-2'));
console.log('3-5 lessons:', curriculum.getTotalLessons('3-5'));
console.log('6-8 lessons:', curriculum.getTotalLessons('6-8'));
console.log('9-12 lessons:', curriculum.getTotalLessons('9-12'));

