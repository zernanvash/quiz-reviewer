import { copyFileSync } from 'node:fs';

// The source entry is separate from the checked-in static deployment entry.
copyFileSync('dist/dev.html', 'dist/index.html');
