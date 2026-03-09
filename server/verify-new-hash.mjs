import bcrypt from 'bcryptjs';

const password = 'KpAms@2025';
const newHash = '$2a$10$xWCoSeTFNUX2XB2dBLYixe5Te3A7lqbeUbpiPm2oTvcnCK3dvtf3a';

bcrypt.compare(password, newHash, (err, isMatch) => {
  if (err) {
    console.error('Error:', err.message);
  } else {
    console.log('New hash matches:', isMatch);
  }
  process.exit(0);
});
