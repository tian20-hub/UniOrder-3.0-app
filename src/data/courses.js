export const courses = [
  'BS Nursing',
  'BS Medical Laboratory Sciences',
  'BS Psychology',
  'BS Radiologic Technology',
  'BS Accountancy',
  'BS Business Administration – Financial Management',
  'BS Business Administration – Marketing Management',
  'BS Hospitality Management',
  'BS Tourism Management',
  'Bachelor of Elementary Education',
  'Bachelor of Secondary Education – Filipino',
  'Bachelor of Secondary Education – English',
  'BS Criminology',
  'BS Information Technology',
]

const courseUniformSet = {
  'BS Nursing': 'health',
  'BS Medical Laboratory Sciences': 'health',
  'BS Psychology': 'general',
  'BS Radiologic Technology': 'health',
  'BS Accountancy': 'business',
  'BS Business Administration – Financial Management': 'business',
  'BS Business Administration – Marketing Management': 'business',
  'BS Hospitality Management': 'service',
  'BS Tourism Management': 'service',
  'Bachelor of Elementary Education': 'education',
  'Bachelor of Secondary Education – Filipino': 'education',
  'Bachelor of Secondary Education – English': 'education',
  'BS Criminology': 'practical',
  'BS Information Technology': 'practical',
}

export const courseUniforms = {
  health: [1, 2, 3, 5],
  business: [1, 2, 3, 4, 5],
  service: [1, 2, 3, 4, 5],
  education: [1, 2, 3, 4, 5, 6],
  practical: [1, 2, 3, 5],
  general: [1, 2, 3, 4, 5],
}

export function getCourseUniformsForCourse(course) {
  const uniformSet = courseUniformSet[course]
  return uniformSet ? courseUniforms[uniformSet] : []
}
