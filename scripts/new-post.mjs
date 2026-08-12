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
const postsDataPath = path.join(__dirname, '../src/data', `posts.json`);
const postsBarPartialPath = path.join(__dirname, '../src/partials', `post-side-bar.ejs`);
const archivesPartialPath = path.join(__dirname, '../src/partials', `archives-all-posts.ejs`);
const feedPath = path.join(__dirname, '../src/pages', `feed.xml`);
// Data structures
const newPostItem = {
    title: `${postTitle}`,
    path: `/posts/${postFileName}`,
    date: `${postDate.toLocaleString('default', { month: 'short' })} ${postDate.getFullYear()}`,
    id: `tag:andrewmaul.com,${formattedDate}:/posts/${postFileName}`,
    updated: `${postDate.toISOString()}`,
    summary: `${postSummary}`
};

const numberOfPostsInSidebar = 9;

const rssBegin = `<?xml version="1.0" encoding="UTF-8"?><feed xmlns="http://www.w3.org/2005/Atom"><title>Andrew Maul - Blog</title><link href="https://andrewmaul.com"/><id>tag:andrewmaul.com,2026-02-01:/root</id><author><name>Andrew Maul</name></author>`;

const rssEnd = `</feed>`;

// Helper functions
function createListItem(data) {
    return `<li><a href="${data.path}">${data.title}</a><br /><em>${data.date}</em></li>`;
}

function createListBlob(posts, limiter) {
    let blob = '';
    const maximumItems = limiter ? limiter : posts.length;
    const terminalItem = `<li><a href="/archives">All Blog Posts</a></li>`;
    for (let index = 0; index < maximumItems; index++) {
        blob += createListItem(posts[index]);
    }
    if(limiter) {
        blob += terminalItem;
    }
    return `<ul>${blob}</ul>`;
}

function createFeedItem(data) {
    return `<entry><title>${data.title}</title><link href="https://andrewmaul.com${data.path}"/><id>tag:andrewmaul.com,${data.updated.split('T')[0]}:${data.path}</id><updated>${data.updated}</updated><summary>${data.summary}</summary><content type="html"><p>${data.summary}</p></content></entry>`;
}
function createRssBlob(posts) {
    let blob = '';
    for (let index = 0; index < posts.length; index++) {
        blob += createFeedItem(posts[index]);
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
    const postsData = readFileSync(postsDataPath, 'utf8', (err, data) => {return data;});
    const parsedData = JSON.parse(postsData);
    parsedData.posts.unshift(newPostItem);
    writeFileSync(postsDataPath, JSON.stringify(parsedData), 'utf8', () => {});
    
    console.log(`Updating posts side bar partial/HTML...`);
    const postsHTML = createListBlob(parsedData.posts, numberOfPostsInSidebar);
    writeFileSync(postsBarPartialPath, postsHTML, 'utf8', () => {});

    console.log(`Updating archives partial/HTML...`);
    const archivesHTML = createListBlob(parsedData.posts, null);
    writeFileSync(archivesPartialPath, postsHTML, 'utf8', () => {});

    console.log(`Updating RSS feed XML...`);
    const feedXML = createRssBlob(parsedData.posts);
    writeFileSync(feedPath, feedXML, 'utf8', () => {});

} catch (error) {
    console.log(error);
}




