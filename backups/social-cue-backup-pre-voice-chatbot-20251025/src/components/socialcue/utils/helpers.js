// Helper functions
export const getGradeRange = (grade) => {
  // Convert grade number to grade range for scenario content
  const gradeNum = parseInt(grade) || 5;
  
  if (gradeNum <= 2) return 'k2';
  if (gradeNum <= 5) return '3-5';
  if (gradeNum <= 8) return '6-8';
  return '9-12';
};