import bcrypt from 'bcryptjs';

/**
 * Yönetici şifresinin bcrypt özetini üretir.
 *
 *   npm run admin:hash -- "cok-guclu-bir-sifre"
 *
 * Çıktıyı ADMIN_PASSWORD_HASH ortam değişkenine yazın.
 */
const password = process.argv[2];

if (!password) {
  console.error('Kullanım: npm run admin:hash -- "<sifre>"');
  process.exit(1);
}

if (password.length < 10) {
  console.error('Şifre en az 10 karakter olmalı.');
  process.exit(1);
}

const hash = bcrypt.hashSync(password, 12);

console.log('\nADMIN_PASSWORD_HASH değeri:\n');
console.log(hash);
console.log('\nBu satırı .env dosyanıza (ve Vercel ortam değişkenlerine) ekleyin:\n');
console.log(`ADMIN_PASSWORD_HASH="${hash}"\n`);
