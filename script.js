const menu = document.getElementById("menu");
const categoriesContainer = document.getElementById("categories");
const featuredSection = document.getElementById("featuredSection");
const featuredMenu = document.getElementById("featuredMenu");
const searchInput = document.getElementById("searchInput");
const clearSearch = document.getElementById("clearSearch");

let allProducts = [];
let currentCategory = "الكل";
let searchQuery = "";

/* =========================================
   تحميل المنيو من JSON
========================================= */

async function loadMenu() {
    try {
        const response = await fetch("./data/menu.json");

        if (!response.ok) {
            throw new Error("Cannot load menu.json");
        }

        const data = await response.json();

        allProducts = data.items || [];

        allProducts = allProducts.map(product => ({
            ...product,

            notes: Array.isArray(product.notes)
                ? product.notes
                : [],

            ingredients: Array.isArray(product.ingredients)
                ? product.ingredients
                : [],

            available:
                product.available === undefined
                    ? true
                    : Number(product.available) === 1,

            featured:
                product.featured === undefined
                    ? false
                    : Number(product.featured) === 1
        }));

        createCategoryButtons();
        displayFeatured();
        displayProducts("الكل");

    } catch (error) {
        console.error("Menu Error:", error);

        if (menu) {
            menu.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">❌</div>
                    <h3>حدث خطأ في تحميل القائمة</h3>
                    <p>تعذر تحميل بيانات المنيو.</p>
                </div>
            `;
        }
    }
}


/* =========================================
   FEATURED
========================================= */

function displayFeatured() {

    if (!featuredSection || !featuredMenu) {
        return;
    }

    const featuredProducts =
        allProducts.filter(product => product.featured);

    if (featuredProducts.length === 0) {
        featuredSection.style.display = "none";
        featuredMenu.innerHTML = "";
        return;
    }

    featuredSection.style.display = "block";
    featuredMenu.innerHTML = "";

    featuredProducts.sort((a, b) => b.id - a.id);

    featuredProducts.forEach(product => {

        const card = createFlipCard(product, true);

        featuredMenu.appendChild(card);

    });
}


/* =========================================
   الأقسام
========================================= */

function createCategoryButtons() {

    if (!categoriesContainer) {
        return;
    }

    categoriesContainer.innerHTML = "";

    const categories = [
        {
            name: "القهوة",
            title: "القهوة",
            icon: "☕",
            english: "Coffee"
        },
        {
            name: "الحلا",
            title: "الحلا",
            icon: "🍰",
            english: "Desserts"
        },
        {
            name: "الفطور",
            title: "الفطور",
            icon: "🍳",
            english: "Breakfast"
        }
    ];

    categories.forEach(category => {

        const card = document.createElement("div");

        card.classList.add("category-card");

        card.innerHTML = `
            <div class="category-icon">
                ${category.icon}
            </div>

            <h3>
                ${escapeHTML(category.title)}
            </h3>

            <span>
                ${escapeHTML(category.english)}
            </span>
        `;

        card.addEventListener("click", () => {

            document
                .querySelectorAll(".category-card")
                .forEach(item => {
                    item.classList.remove("active");
                });

            card.classList.add("active");

            currentCategory = category.name;

            displayProducts(currentCategory);

            if (menu) {
                menu.scrollIntoView({
                    behavior: "smooth"
                });
            }

        });

        categoriesContainer.appendChild(card);

    });
}


/* =========================================
   المنتجات
========================================= */

function displayProducts(category = currentCategory) {

    if (!menu) {
        return;
    }

    currentCategory = category;

    menu.innerHTML = "";

    let products = [...allProducts];

    /* فلترة القسم */

    if (category !== "الكل") {

        products = products.filter(
            product =>
                product.category === category
        );

    }

    /* البحث */

    if (searchQuery.trim() !== "") {

        const query =
            searchQuery.trim().toLowerCase();

        products = products.filter(product => {

            const name =
                String(product.name || "").toLowerCase();

            const description =
                String(product.description || "").toLowerCase();

            const categoryName =
                String(product.category || "").toLowerCase();

            return (
                name.includes(query) ||
                description.includes(query) ||
                categoryName.includes(query)
            );

        });

    }

    /* المميز أولًا */

    products.sort((a, b) => {

        if (a.featured && !b.featured) {
            return -1;
        }

        if (!a.featured && b.featured) {
            return 1;
        }

        return b.id - a.id;

    });

    /* لا توجد نتائج */

    if (products.length === 0) {

        menu.innerHTML = `
            <div class="empty-state">

                <div class="empty-icon">
                    🔍
                </div>

                <h3>
                    لا توجد نتائج
                </h3>

                <p>
                    لم نجد صنفًا مطابقًا للبحث.
                </p>

            </div>
        `;

        return;
    }

    const productsContainer =
        document.createElement("div");

    productsContainer.classList.add("products");

    products.forEach(product => {

        const card =
            createFlipCard(product, false);

        productsContainer.appendChild(card);

    });

    menu.appendChild(productsContainer);
}


/* =========================================
   البحث
========================================= */

function setupSearch() {

    if (!searchInput) {
        return;
    }

    searchInput.addEventListener("input", () => {

        searchQuery =
            searchInput.value;

        displayProducts(currentCategory);

        if (clearSearch) {

            clearSearch.style.display =
                searchQuery.trim() !== ""
                    ? "block"
                    : "none";

        }

    });

    if (clearSearch) {

        clearSearch.addEventListener("click", () => {

            searchInput.value = "";

            searchQuery = "";

            clearSearch.style.display = "none";

            displayProducts(currentCategory);

            searchInput.focus();

        });

    }
}


/* =========================================
   بطاقة المنتج
========================================= */

function createFlipCard(product, isFeaturedSection = false) {

    const wrapper =
        document.createElement("div");

    wrapper.classList.add("flip-card");

    if (!product.available) {
        wrapper.classList.add("unavailable-card");
    }

    if (product.featured) {
        wrapper.classList.add("featured-card");
    }

    const availabilityBadge =
        product.available
            ? `
                <span class="availability available">
                    🟢 متوفر
                </span>
              `
            : `
                <span class="availability unavailable">
                    🔴 غير متوفر
                </span>
              `;

    const featuredBadge =
        product.featured
            ? `
                <span class="featured-badge">
                    ⭐ مميز
                </span>
              `
            : "";

    let backContent = "";

    /* القهوة */

    if (product.category === "القهوة") {

        backContent = `
            <h3>
                ${escapeHTML(product.name)}
            </h3>

            <h4>
                إيحاءات القهوة
            </h4>

            <div class="notes">

                ${
                    product.notes.length > 0

                        ? product.notes.map(note => `
                            <span>
                                ☕
                                ${escapeHTML(note)}
                            </span>
                        `).join("")

                        : `
                            <span>
                                لا توجد إيحاءات
                            </span>
                          `
                }

            </div>

            ${
                product.roast
                    ? `
                        <p>
                            درجة التحميص:
                            <strong>
                                ${escapeHTML(product.roast)}
                            </strong>
                        </p>
                      `
                    : ""
            }

            <strong>
                ${escapeHTML(product.price)}
                ريال
            </strong>
        `;

    }

    /* الحلا والفطور */

    else {

        backContent = `
            <h3>
                ${escapeHTML(product.name)}
            </h3>

            <h4>
                المكونات
            </h4>

            <div class="ingredients">

                ${
                    product.ingredients.length > 0

                        ? product.ingredients.map(item => `
                            <span>
                                •
                                ${escapeHTML(item)}
                            </span>
                        `).join("")

                        : `
                            <span>
                                لا توجد مكونات
                            </span>
                          `
                }

            </div>

            <strong>
                ${escapeHTML(product.price)}
                ريال
            </strong>
        `;

    }

    /*
       الصور:
       الصور موجودة داخل public/images
       ونسخة الموقع تستخدم مجلد images
    */

    let imagePath =
        product.image || "images/default.jpg";

    /* تحويل images/... إلى public/images/... */

    if (imagePath.startsWith("images/")) {
        imagePath = "public/" + imagePath;
    }

    wrapper.innerHTML = `

        <div class="flip-card-inner">

            <!-- FRONT -->

            <div class="flip-card-front">

                ${
                    product.featured
                        ? `
                            <div class="featured-ribbon">
                                ⭐ مميز
                            </div>
                          `
                        : ""
                }

                <img
                    src="${escapeHTML(imagePath)}"
                    alt="${escapeHTML(product.name)}"
                    onerror="this.src='public/images/default.jpg'"
                >

                <div class="card-content">

                    ${featuredBadge}

                    ${availabilityBadge}

                    <h3>
                        ${escapeHTML(product.name)}
                    </h3>

                    <p>
                        ${escapeHTML(product.description || "")}
                    </p>

                    <strong>
                        ${escapeHTML(product.price)}
                        ريال
                    </strong>

                    <small>
                        اضغط لمعرفة التفاصيل
                    </small>

                </div>

            </div>


            <!-- BACK -->

            <div class="flip-card-back">

                ${
                    product.featured
                        ? `
                            <div class="back-featured">
                                ⭐ اختيار QUAINT
                            </div>
                          `
                        : ""
                }

                ${backContent}

                <small>
                    اضغط للعودة
                </small>

            </div>

        </div>
    `;

    wrapper.addEventListener("click", () => {

        wrapper.classList.toggle("flipped");

    });

    return wrapper;
}


/* =========================================
   حماية HTML
========================================= */

function escapeHTML(value) {

    if (
        value === null ||
        value === undefined
    ) {
        return "";
    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


/* =========================================
   تشغيل
========================================= */

setupSearch();
loadMenu();