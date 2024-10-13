const express = require('express');
const path = require('path');
const fileupload = require('express-fileupload');
const fs = require('fs');

let initial_path = path.join(__dirname, "public");

const app = express();
app.use(express.static(initial_path));
app.use(fileupload());
app.use(express.json()); // for parsing application/json

app.get('/', (req, res) => {
    res.sendFile(path.join(initial_path, "index.html"));
})

app.get('/editor', (req, res) => {
    res.sendFile(path.join(initial_path, "editor.html"));
})

// upload link
app.post('/upload', (req, res) => {
    let file = req.files.image;
    let date = new Date();
    // image name
    let imagename = date.getDate() + date.getTime() + file.name;
    // image upload path
    let path = 'public/uploads/' + imagename;

    // create upload
    file.mv(path, (err, result) => {
        if(err){
            throw err;
        } else{
            // our image upload path
            res.json(`uploads/${imagename}`)
        }
    })
})

// New endpoint to create blog HTML file
app.post('/create-blog', (req, res) => {
    const { fileName, blogData } = req.body;
    const filePath = path.join(initial_path, `${fileName}.html`);

    // Read the blog.html template
    fs.readFile(path.join(initial_path, 'blog.html'), 'utf8', (err, template) => {
        if (err) {
            console.error('Error reading blog template:', err);
            return res.status(500).json({ error: 'Failed to create blog post' });
        }

        // Replace placeholders in the template
        let htmlContent = template
            .replace('class="banner"', `class="banner" style="background-image: url(${blogData.bannerImage});"`)
            .replace('<h1 id="section" class="title"></h1>', `<h1 id="section" class="title">${blogData.title}</h1>`)
            .replace('Paylaşıldı -', `Paylaşıldı - ${blogData.publishedAt}`)
            .replace('<div class="article">', `<div class="article">${blogData.article}`);

        // Write the file
        fs.writeFile(filePath, htmlContent, (writeErr) => {
            if (writeErr) {
                console.error('Error writing file:', writeErr);
                res.status(500).json({ error: 'Failed to create blog post' });
            } else {
                console.log('Blog post created successfully');
                // Also save blog metadata for listing
                saveBlogMetadata(fileName, blogData);
                res.json({ success: true, fileName: `${fileName}.html` });
            }
        });
    });
});

// New function to save blog metadata
function saveBlogMetadata(fileName, blogData) {
    const metadataPath = path.join(initial_path, 'blogMetadata.json');
    let metadata = [];
    if (fs.existsSync(metadataPath)) {
        metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
    }
    metadata.push({
        id: fileName,
        title: blogData.title,
        bannerImage: blogData.bannerImage,
        article: blogData.article,
        publishedAt: blogData.publishedAt
    });
    fs.writeFileSync(metadataPath, JSON.stringify(metadata));
}

// New endpoint to get blog metadata
app.get('/get-blogs', (req, res) => {
    const metadataPath = path.join(initial_path, 'blogMetadata.json');
    if (fs.existsSync(metadataPath)) {
        const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
        res.json(metadata);
    } else {
        res.json([]);
    }
});

app.get("/:blog", (req, res) => {
    const blogPath = path.join(initial_path, `${req.params.blog}.html`);
    if (fs.existsSync(blogPath)) {
        res.sendFile(blogPath);
    } else {
        res.status(404).sendFile(path.join(initial_path, "404.html"));
    }
})

app.use((req, res) => {
    res.status(404).sendFile(path.path.join(initial_path, "404.html"));
})

app.listen("3000", () => {
    console.log('listening......');
})