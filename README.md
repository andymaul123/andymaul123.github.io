# andymaul123.github.io
GitHub Pages Website
Built using [Nanogen SSG](https://doug2k1.github.io/nanogen/docs/).

View the live site at [www.andrewmaul.com](https://www.andrewmaul.com/).

## Development
- `npm install`
- `npm run start` to start the local server at port 3000
- `npm run css` to compile SASS
- `npm run build` to compile the site into the `/public` directory

After changes are made, pushing to `main` in Github will trigger the Github Pages workflow. Nothing else needed!

## New Post
A little reminder to myself until I automate this:
- Create a new post file under pages/posts
- Create the same directory name under assets/image/posts and drop any images needed
- Update site.config.js
- Update partials/archives.ejs
