import { createInterface } from 'node:readline';

import bcrypt from 'bcryptjs';

/**
 * Yönetici şifresinin bcrypt özetini üretir.
 *
 *   npm run admin:hash
 *
 * Şifre komut satırında argüman olarak DA verilebilir, ancak önerilmez:
 * argümanlar kabuk geçmişine (`~/.zsh_history`) ve süreç listesine düşer,
 * ayrıca `!` gibi karakterler zsh'te geçmiş genişletmesi tetikler.
 * Argüman verilmezse şifre gizli olarak sorulur.
 */

const MIN_LENGTH = 10;

/** Girişi ekrana yazdırmadan okur. */
function askHidden(question: string): Promise<string> {
  return new Promise((resolve) => {
    const input = process.stdin;
    const output = process.stdout;
    const rl = createInterface({ input, output, terminal: true });

    output.write(question);

    // Yazılan karakterler ekranda görünmesin.
    const onData = (chunk: Buffer | string) => {
      const text = chunk.toString();
      // Enter'a basıldığında dinlemeyi bırak.
      if (text.includes('\n') || text.includes('\r')) input.off('data', onData);
    };

    const originalWrite = output.write.bind(output);
    let muted = true;

    (output as NodeJS.WriteStream & { write: typeof output.write }).write = ((
      data: string | Uint8Array,
      ...rest: unknown[]
    ) => {
      if (muted && typeof data === 'string' && !data.includes(question)) return true;

      return originalWrite(data as string, ...(rest as []));
    }) as typeof output.write;

    input.on('data', onData);

    rl.question('', (answer) => {
      muted = false;
      output.write = originalWrite;
      output.write('\n');
      rl.close();
      resolve(answer);
    });
  });
}

async function main() {
  const fromArgument = process.argv[2];

  const password = fromArgument ?? (await askHidden('Yönetici şifresi: '));

  if (!password) {
    console.error('Şifre boş olamaz.');
    process.exit(1);
  }

  if (password.length < MIN_LENGTH) {
    console.error(`Şifre en az ${MIN_LENGTH} karakter olmalı.`);
    process.exit(1);
  }

  if (!fromArgument) {
    const again = await askHidden('Şifreyi tekrar girin: ');

    if (again !== password) {
      console.error('Şifreler eşleşmedi.');
      process.exit(1);
    }
  }

  const hash = bcrypt.hashSync(password, 12);

  console.log('\nADMIN_PASSWORD_HASH değeri (tamamını kopyalayın):\n');
  console.log(hash);
  console.log('\nBunu Vercel > Settings > Environment Variables altına yapıştırın.');
  console.log('Giriş ekranına ise özeti değil, az önce yazdığınız şifreyi girin.\n');
}

void main();
