// Blog ID'sini al ve kontrol et
let blogId = decodeURI(location.pathname.split("/").pop());
console.log("Blog ID:", blogId);

if (!blogId) {
    console.error("Geçerli bir blog ID'si bulunamadı.");
    document.querySelector('.blog').innerHTML = '<h1>Geçersiz blog URL'si</h1>';
    throw new Error("Geçersiz blog ID'si");
}

// Firebase bağlantısını kontrol et
if (!db || typeof db.collection !== 'function') {
    console.error("Firebase bağlantısı kurulamadı veya db objesi bulunamadı.");
    document.querySelector('.blog').innerHTML = '<h1>Veritabanı bağlantısı kurulamadı</h1>';
    throw new Error("Firebase bağlantısı hatası");
}

let docRef = db.collection("blogs").doc(blogId);

// Blog verilerini tutacak bir değişken tanımlayalım
let blogData = null;

docRef.get().then((doc) => {
    console.log("Firestore sorgusu tamamlandı.");
    if(doc.exists){
        console.log("Blog bulundu, veri yükleniyor...");
        blogData = doc.data();
        console.log("Blog verisi:", blogData);
        setupBlog(blogData);
    } else{
        console.log("Blog bulunamadı! Blog ID:", blogId);
        document.querySelector('.blog').innerHTML = '<h1>Blog bulunamadı!</h1>';
    }
}).catch(error => {
    console.error("Firestore sorgusu sırasında hata oluştu:", error);
    document.querySelector('.blog').innerHTML = '<h1>Bir hata oluştu. Lütfen daha sonra tekrar deneyin.</h1>';
});

const setupBlog = (data) => {
    console.log("setupBlog başladı", data);
    
    if (!data) {
        console.error("setupBlog fonksiyonuna geçersiz veri gönderildi.");
        return;
    }
    
    const banner = document.querySelector('.banner');
    const blogTitle = document.querySelector('.title');
    const titleTag = document.querySelector('title');
    const publish = document.querySelector('.published');
    
    if (data.bannerImage) {
        banner.style.backgroundImage = `url(${data.bannerImage})`;
    } else {
        console.warn("Banner resmi bulunamadı.");
    }

    if (data.title) {
        titleTag.innerHTML += data.title;
        blogTitle.innerHTML = data.title;
    } else {
        console.warn("Blog başlığı bulunamadı.");
    }

    if (data.publishedAt) {
        publish.innerHTML += data.publishedAt;
    } else {
        console.warn("Yayın tarihi bulunamadı.");
    }

    const article = document.querySelector('.article');
    if (data.article) {
        addArticle(article, data.article);
    } else {
        console.warn("Makale içeriği bulunamadı.");
    }
    
    console.log("setupBlog tamamlandı");
}

const addArticle = (ele, data) => {
    if (!data) {
        console.error("Makale içeriği bulunamadı");
        return;
    }

    data = data.split("\n").filter(item => item.length);

    data.forEach(item => {
        if(item[0] == '#'){
            let hCount = 0;
            let i = 0;
            while(item[i] == '#'){
                hCount++;
                i++;
            }
            let tag = `h${hCount}`;
            ele.innerHTML += `<${tag}>${item.slice(hCount, item.length)}</${tag}>`;
        } 
        else if(item[0] == "!" && item[1] == "["){
            let seperator;

            for(let i = 0; i <= item.length; i++){
                if(item[i] == "]" && item[i + 1] == "(" && item[item.length - 1] == ")"){
                    seperator = i;
                }
            }

            let alt = item.slice(2, seperator);
            let src = item.slice(seperator + 2, item.length - 1);
            ele.innerHTML += `<img src="${src}" alt="${alt}" class="article-image">`;
        }
        else{
            ele.innerHTML += `<p>${item}</p>`;
        }
    });
    
    console.log("Makale eklendi");
}

// Sayfa yüklendiğinde ve URL değiştiğinde çalışacak bir fonksiyon
const loadBlogContent = () => {
    if (blogData) {
        setupBlog(blogData);
    } else {
        console.log("Blog verisi henüz yüklenmedi, yeniden deneniyor...");
        setTimeout(loadBlogContent, 500); // 500ms sonra tekrar dene
    }
};

// Sayfa yüklendiğinde çalıştır
window.addEventListener('load', loadBlogContent);

// URL değiştiğinde çalıştır (Tek Sayfa Uygulamaları için)
window.addEventListener('popstate', loadBlogContent);