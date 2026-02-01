import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('Copying RSS feed data...');
try {
    const readPath = path.join(__dirname, '../src/pages', 'feed.xml');
    const rssData = readFileSync(readPath, 'utf8', (err, data) => {return data;});
    console.log('Successfully read feed xml.');
    const writePath = path.join(__dirname, '../public', 'feed.xml');
    writeFileSync(writePath, rssData, 'utf8', () => {
        console.log(`Writing contents to public/feed.xml`);
    });
    console.log('Feed data successfully copied into build.');
} catch (error) {
    console.log('error!');
    console.dir(error);
}

