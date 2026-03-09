import bcrypt from 'bcryptjs';

const password = 'KpAms@2025';

bcrypt.hash(password, 10, (err, hash) => {
  if (err) {
    console.error('Error:', err);
  } else {
    console.log('Correct hash for KpAms@2025:', hash);
  }
  process.exit(0);
});
