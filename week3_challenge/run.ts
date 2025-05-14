import { runChallenge } from './implementation';

console.log('Starting Challenge 3...');
runChallenge()
  .then(() => console.log('Challenge completed successfully!'))
  .catch(error => console.error('Error executing challenge:', error)); 