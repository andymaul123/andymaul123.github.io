import { input } from '@inquirer/prompts';
import { readFileSync, writeFileSync, existsSync, mkdirSync, appendFileSync } from 'node:fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('This wizard will scaffold a new blog post.');
// Various paths the script needs to access
const postTitle = await input({ message: 'Enter the title of the post.' });
const formattedPostTitle = postTitle.toLowerCase().replace(/[^a-zA-Z ]/g, '').split(' ').join('-');
const postSummary = await input({ message: 'Enter the post\'s summary or description. One to two sentences.' });
const postDate = new Date();
const formattedDate = postDate.toISOString().split('T')[0];
const postFileName = `${formattedDate}_${formattedPostTitle}`;
const newPostPath = path.join(__dirname, '../src/pages/posts', `${postFileName}.ejs`);
const newPostAssetPath = path.join(__dirname, '../src/assets/image/posts', postFileName);
const siteConfigPath = path.join(__dirname, '../', 'site.config.js');
const siteConfigData = `module.exports = {\n  build: {\n    srcPath: './src',\n    outputPath: './public'\n  },\n  site: {\n    title: 'Andrew Maul',\n    year: ${postDate.getFullYear()},\n    latest: '${postFileName}'\n  }\n};\n`;
const archiveDataPath = path.join(__dirname, '../src/data', `archives.json`);
const archivePartialPath = path.join(__dirname, '../src/partials', `archives.ejs`);
const feedPath = path.join(__dirname, '../src/pages', `feed.xml`);
// Data structures
const newArchiveItem = {
    title: `${postTitle}`,
    path: `/posts/${postFileName}`,
    date: `${postDate.toLocaleString('default', { month: 'short' })} ${postDate.getFullYear()}`,
    id: `tag:andrewmaul.com,${formattedDate}:/posts/${postFileName}`,
    updated: `${postDate.toISOString()}`,
    summary: `${postSummary}`
};

const rssBegin = `<?xml version="1.0" encoding="UTF-8"?><feed xmlns="http://www.w3.org/2005/Atom"><title>Andrew Maul - Blog</title><link href="https://andrewmaul.com"/><id>tag:andrewmaul.com,2026-02-01:/root</id><author><name>Andrew Maul</name></author>`;

const rssEnd = `</feed>`;

// Helper functions
function createListItem(data) {
    return `<li><a href="${data.path}">${data.title}</a><br /><em>${data.date}</em></li>`;
}

function createListBlob(archives) {
    let blob = '';
    for (let index = 0; index < archives.length; index++) {
        blob += createListItem(archives[index]);
    }
    return `<ul>${blob}</ul>`;
}

function createFeedItem(data) {
    return `<entry><title>${data.title}</title><link href="https://andrewmaul.com${data.path}"/><id>tag:andrewmaul.com,${data.updated.split('T')[0]}:${data.path}</id><updated>${data.updated}</updated><summary>${data.summary}</summary><content type="html"><p>${data.summary}</p></content></entry>`;
}
function createRssBlob(archives) {
    let blob = '';
    for (let index = 0; index < archives.length; index++) {
        blob += createFeedItem(archives[index]);
    }
    return `${rssBegin}<updated>${postDate.toISOString()}</updated>${blob}${rssEnd}`;
}

// The actual script steps
try {
    console.log(`Creating empty post: src/pages/posts/${postFileName}.ejs`);
    writeFileSync(newPostPath, '', 'utf8', () => {});
    
    console.log(`Creating empty asset directory: src/assets/image/posts/${postFileName}`);
    if (!existsSync(newPostAssetPath)) {
        mkdirSync(newPostAssetPath);
    }
    
    console.log(`Updating site config...`);
    writeFileSync(siteConfigPath, siteConfigData, 'utf8', () => {});

    console.log(`Updating archives data...`);
    const archiveData = readFileSync(archiveDataPath, 'utf8', (err, data) => {return data;});
    const parsedData = JSON.parse(archiveData);
    parsedData.archives.unshift(newArchiveItem);
    writeFileSync(archiveDataPath, JSON.stringify(parsedData), 'utf8', () => {});
    
    console.log(`Updating archives partial/HTML...`);
    const archiveHTML = createListBlob(parsedData.archives);
    writeFileSync(archivePartialPath, archiveHTML, 'utf8', () => {});

    console.log(`Updating RSS feed XML...`);
    const feedXML = createRssBlob(parsedData.archives);
    writeFileSync(feedPath, feedXML, 'utf8', () => {});

} catch (error) {
    console.log(error);
}




