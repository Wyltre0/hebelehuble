const blogTitleField = document.querySelector('.title');
const articleField = document.querySelector('.article');

// Banner
const bannerImage = document.querySelector('#banner-upload');
const banner = document.querySelector(".banner");
let bannerPath;

const publishBtn = document.querySelector('.publish-btn');
const uploadInput = document.querySelector('#image-upload');

bannerImage.addEventListener('change', () => {
    uploadImage(bannerImage, "banner");
});

uploadInput.addEventListener('change', () => {
    uploadImage(uploadInput, "image");
});

const uploadImage = (uploadFile, uploadType) => {
    const [file] = uploadFile.files;
    if (file && file.type.includes("image")) {
        const formData = new FormData();
        formData.append('image', file);

        fetch('/upload', {
            method: 'post',
            body: formData
        }).then(res => res.json())
          .then(data => {
              if (uploadType === "image") {
                  addImage(data, file.name);
              } else {
                  bannerPath = `${location.origin}/${data}`;
                  banner.style.backgroundImage = `url("${bannerPath}")`;
              }
          }).catch(error => {
              console.error('Error uploading image:', error);
          });
    } else {
        alert("Upload Image only");
    }
};

const addImage = (imagePath, alt) => {
    let curPos = articleField.selectionStart;
    let textToInsert = `\r![${alt}](${imagePath})\r`;
    articleField.value = articleField.value.slice(0, curPos) + textToInsert + articleField.value.slice(curPos);
};

let months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

publishBtn.addEventListener('click', () => {
    const title = blogTitleField.value.trim();
    const content = articleField.value.trim();

    if (title.length > 100) {
        alert("Blog başlığı 100 karakterden fazla olamaz.");
        return;
    }

    if (content.length > 2000) {
        alert("Blog içeriği 2000 karakterden fazla olamaz.");
        return;
    }

    if (title.length && content.length) {
        // Generating ID
        let letters = 'abcdefghijklmnopqrstuvwxyz';
        let blogTitle = title.split(" ").join("-");
        let id = '';
        for (let i = 0; i < 4; i++) {
            id += letters[Math.floor(Math.random() * letters.length)];
        }

        // Setting up docName
        let docName = `${blogTitle}-${id}`;
        let date = new Date(); // For published at info

        // Check if bannerPath is defined
        if (!bannerPath) {
            alert('Please upload a banner image before publishing.');
            return;
        }

        // Create blog data
        let blogData = {
            title: title,
            article: content,
            bannerImage: bannerPath,
            publishedAt: `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`
        };

        // Send blog data to server to create file
        fetch('/create-blog', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                fileName: docName,
                blogData: blogData
            }),
        })
        .then(response => response.json())
        .then(data => {
            console.log('Success:', data);
            alert("Blog post published successfully!");
            location.href = `/${docName}`;
        })
        .catch((error) => {
            console.error('Error:', error);
            alert("An error occurred while publishing the blog post. Please try again.");
        });

    } else {
        alert("Please fill in both the title and content before publishing.");
    }
});

// ... (formatText, insertCode, insertLink functions remain the same)