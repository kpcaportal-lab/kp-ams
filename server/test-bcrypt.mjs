import bcrypt from 'bcryptjs';

const hash = '$2b$10$sx4dh9G.Zgua6cbEpw9McNhgB45FyTaR6YIOkBHMpP4r1Xv4H/SjO';
const password = 'KpAms@2025';

bcrypt.compare(password, hash, (err, isMatch) => {
  if (err) {
    console.error('Error:', err.message);
  } else {
    console.log('Password matches with bcryptjs 2.4.3:', isMatch);
  }
  process.exit(0);
});
