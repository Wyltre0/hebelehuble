const blogSection = document.querySelector('.blogs-section');
const searchBar = document.querySelector('.search-container input');
const searchButton = document.querySelector('.search-container button');

// Blog gösterim sınırı
const blogLimit = 10;

// Ana sayfada belirli sayıda blog göster
fetch('/get-blogs')
    .then(response => response.json())
    .then(blogs => {
        blogs.slice(0, blogLimit).forEach(blog => {
            createBlog(blog);
        });
    });

const createBlog = (blog) => {
    blogSection.innerHTML += `
    <div class="blog-card">
        <img src="${blog.bannerImage}" class="blog-image" alt="">
        <h1 class="blog-title">${blog.title.substring(0, 100) + '...'}</h1>
        <p class="blog-overview">${blog.article.substring(0, 200) + '...'}</p>
        <a href="/${blog.id}" class="btn dark">read</a>
    </div>
    `;
};

// Arama butonuna tıklama olayı
searchButton.addEventListener('click', () => {
    let searchQuery = searchBar.value.toLowerCase();
    blogSection.innerHTML = '';  // Önceki sonuçları temizle
    fetch('/get-blogs')
        .then(response => response.json())
        .then(blogs => {
            blogs.forEach(blog => {
                if (blog.title.toLowerCase().includes(searchQuery) || blog.article.toLowerCase().includes(searchQuery)) {
                    createBlog(blog);
                }
            });
        });
});