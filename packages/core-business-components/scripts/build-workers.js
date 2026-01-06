import { minify } from 'terser';
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import process from 'node:process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const workerDir = join(__dirname, '..', 'lib', 'worker');

try {
  const files = readdirSync(workerDir).filter((file) => file.endsWith('.js'));

  for (const file of files) {
    const filePath = join(workerDir, file);
    const code = readFileSync(filePath, 'utf-8');

    const result = await minify(code, {
      compress: {
        drop_console: false,
        pure_funcs: null,
      },
      mangle: true,
      format: {
        comments: false,
      },
    });

    if (result.code) {
      writeFileSync(filePath, result.code, 'utf-8');
      console.log(`✓ Compressed: ${file}`);
    } else {
      console.error(`✗ Failed to compress: ${file}`);
    }
  }

  console.log('Worker files compressed successfully!');
} catch (error) {
  console.error('Error compressing worker files:', error);
  process.exit(1);
}
