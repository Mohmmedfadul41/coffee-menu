/* =========================================================
   QUAINT - PREMIUM MENU JS
========================================================= */

const menuSection =
    document.getElementById("menu");

const productsContainer =
    document.getElementById("products");

const categoriesContainer =
    document.getElementById("categories");

const featuredSection =
    document.getElementById("featuredSection");

const featuredMenu =
    document.getElementById("featuredMenu");

const searchInput =
    document.getElementById("searchInput");

const clearSearch =
    document.getElementById("clearSearch");

const productsCount =
    document.getElementById("productsCount");

const topButton =
    document.getElementById("topBtn");


let allProducts = [];

let currentCategory = "الكل";

let searchQuery = "";


/* =========================================================
   تحميل القائمة
========================================================= */

async function loadMenu() {

    try {

        const response =
            await fetch("/api/menu-db");


        if (!response.ok) {
            throw new Error("API Error");
        }


        const data =
            await response.json();


        allProducts =
            data.items || [];


        /* تحويل البيانات */

        allProducts =
            allProducts.map(product => {

                return {

                    ...product,

                    id:
                        Number(product.id) || 0,

                    price:
                        product.price ?? "",

                    notes:
                        parseJSON(product.notes),

                    ingredients:
                        parseJSON(product.ingredients),

                    available:
                        Number(product.available) === 1 ||
                        product.available === true,

                    featured:
                        Number(product.featured) === 1 ||
                        product.featured === true

                };

            });


        /* تشغيل الواجهة */

        createCategoryButtons();

        displayFeatured();

        displayProducts("الكل");

    }


    catch (error) {

        console.error(
            "QUAINT Menu Error:",
            error
        );


        if (productsContainer) {

            productsContainer.innerHTML = `

                <div class="empty-state">

                    <div class="empty-icon">
                        ⚠️
                    </div>

                    <h3>
                        تعذر تحميل القائمة
                    </h3>

                    <p>
                        حدث خطأ أثناء الاتصال بالخادم.
                        حاول تحديث الصفحة.
                    </p>

                </div>

            `;

        }

    }

}


/* =========================================================
   تحويل JSON
========================================================= */

function parseJSON(value) {

    if (!value) {
        return [];
    }


    if (Array.isArray(value)) {
        return value;
    }


    try {

        let result =
            JSON.parse(value);


        /* إذا كان JSON داخل JSON */

        if (typeof result === "string") {
            result = JSON.parse(result);
        }


        return Array.isArray(result)
            ? result
            : [];

    }

    catch {

        return [];

    }

}


/* =========================================================
   الأقسام
========================================================= */

function createCategoryButtons() {

    if (!categoriesContainer) {
        return;
    }


    categoriesContainer.innerHTML = "";


    const categories = [

        {
            name: "الكل",
            title: "كل القائمة",
            icon: "✨",
            english: "All Menu"
        },

        {
            name: "قهوة",
            title: "القهوة",
            icon: "☕",
            english: "Coffee"
        },

        {
            name: "حلا",
            title: "الحلا",
            icon: "🍰",
            english: "Desserts"
        },

        {
            name: "فطور",
            title: "الفطور",
            icon: "🍳",
            english: "Breakfast"
        }

    ];


    categories.forEach(category => {

        const card =
            document.createElement("div");


        card.classList.add(
            "category-card"
        );


        if (
            category.name ===
            currentCategory
        ) {

            card.classList.add(
                "active"
            );

        }


        card.innerHTML = `

            <div class="category-icon">
                ${category.icon}
            </div>

            <h3>
                ${escapeHTML(
                    category.title
                )}
            </h3>

            <span>
                ${escapeHTML(
                    category.english
                )}
            </span>

        `;


        card.addEventListener(
            "click",
            () => {

                document
                    .querySelectorAll(
                        ".category-card"
                    )
                    .forEach(item => {

                        item.classList.remove(
                            "active"
                        );

                    });


                card.classList.add(
                    "active"
                );


                currentCategory =
                    category.name;


                displayProducts(
                    currentCategory
                );


                if (menuSection) {

                    menuSection.scrollIntoView({

                        behavior: "smooth",

                        block: "start"

                    });

                }

            }
        );


        categoriesContainer.appendChild(
            card
        );

    });

}


/* =========================================================
   الأكثر طلباً لدينا
========================================================= */

function displayFeatured() {

    if (
        !featuredSection ||
        !featuredMenu
    ) {

        return;

    }


    /*
       الأصناف التي تم تحديدها كمميز
       من لوحة الإدارة تظهر هنا
       على أنها "الأكثر طلباً لدينا"
    */

    const popularProducts =
        allProducts
            .filter(
                product =>
                    product.featured
            )
            .sort(
                (a, b) =>
                    b.id - a.id
            );


    /* لا يوجد أصناف */

    if (
        popularProducts.length === 0
    ) {

        featuredSection.style.display =
            "none";

        featuredMenu.innerHTML =
            "";

        return;

    }


    /* يوجد أصناف */

    featuredSection.style.display =
        "block";


    featuredMenu.innerHTML =
        "";


    popularProducts.forEach(
        product => {

            const card =
                createFlipCard(
                    product,
                    true
                );


            featuredMenu.appendChild(
                card
            );

        }
    );

}


/* =========================================================
   عرض المنتجات
========================================================= */

function displayProducts(
    category = currentCategory
) {

    if (!productsContainer) {
        return;
    }


    currentCategory =
        category;


    /*
       مهم جداً:
       لا نمسح #menu بالكامل.
       نمسح فقط المنتجات.
    */

    productsContainer.innerHTML =
        "";


    let products =
        [...allProducts];


    /* -----------------------------------------------------
       فلترة القسم
    ----------------------------------------------------- */

    if (
        category !== "الكل"
    ) {

        products =
            products.filter(
                product =>
                    product.category ===
                    category
            );

    }


    /* -----------------------------------------------------
       البحث
    ----------------------------------------------------- */

    if (
        searchQuery.trim() !== ""
    ) {

        const query =
            searchQuery
                .trim()
                .toLowerCase();


        products =
            products.filter(
                product => {

                    const name =
                        String(
                            product.name || ""
                        ).toLowerCase();


                    const description =
                        String(
                            product.description || ""
                        ).toLowerCase();


                    const categoryName =
                        String(
                            product.category || ""
                        ).toLowerCase();


                    return (

                        name.includes(query) ||

                        description.includes(query) ||

                        categoryName.includes(query)

                    );

                }
            );

    }


    /* -----------------------------------------------------
       الأكثر طلباً أولاً
    ----------------------------------------------------- */

    products.sort((a, b) => {

        if (
            a.featured &&
            !b.featured
        ) {

            return -1;

        }


        if (
            !a.featured &&
            b.featured
        ) {

            return 1;

        }


        return b.id - a.id;

    });


    /* -----------------------------------------------------
       تحديث العدد
    ----------------------------------------------------- */

    updateProductsCount(
        products.length
    );


    /* -----------------------------------------------------
       لا توجد نتائج
    ----------------------------------------------------- */

    if (
        products.length === 0
    ) {

        productsContainer.innerHTML = `

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


    /* -----------------------------------------------------
       إنشاء البطاقات
    ----------------------------------------------------- */

    products.forEach(product => {

        const card =
            createFlipCard(
                product,
                false
            );


        productsContainer.appendChild(
            card
        );

    });

}


/* =========================================================
   عدد المنتجات
========================================================= */

function updateProductsCount(count) {

    if (!productsCount) {
        return;
    }


    productsCount.textContent =
        `${count} صنف`;

}


/* =========================================================
   البحث
========================================================= */

function setupSearch() {

    if (!searchInput) {
        return;
    }


    searchInput.addEventListener(
        "input",
        () => {

            searchQuery =
                searchInput.value;


            displayProducts(
                currentCategory
            );


            if (clearSearch) {

                clearSearch.style.display =
                    searchQuery.trim() !== ""
                        ? "block"
                        : "none";

            }

        }
    );


    if (clearSearch) {

        clearSearch.addEventListener(
            "click",
            () => {

                searchInput.value =
                    "";

                searchQuery =
                    "";


                clearSearch.style.display =
                    "none";


                displayProducts(
                    currentCategory
                );


                searchInput.focus();

            }
        );

    }

}


/* =========================================================
   إنشاء بطاقة المنتج
========================================================= */

function createFlipCard(
    product,
    isPopularSection = false
) {

    const wrapper =
        document.createElement("div");


    wrapper.classList.add(
        "flip-card"
    );


    /* -----------------------------------------------------
       غير متوفر
    ----------------------------------------------------- */

    if (!product.available) {

        wrapper.classList.add(
            "unavailable-card"
        );

    }


    /* -----------------------------------------------------
       مميز / الأكثر طلباً
    ----------------------------------------------------- */

    if (product.featured) {

        wrapper.classList.add(
            "featured-card"
        );

    }


    /* -----------------------------------------------------
       حالة المنتج
    ----------------------------------------------------- */

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


    /* -----------------------------------------------------
       شارة الأكثر طلباً
    ----------------------------------------------------- */

    const featuredBadge =
        product.featured

            ? `

                <span class="featured-badge">
                    ⭐ الأكثر طلباً
                </span>

              `

            : "";


    /* -----------------------------------------------------
       محتوى الخلفية
    ----------------------------------------------------- */

    let backContent = "";


    /* =========================
       القهوة
    ========================= */

    if (
        product.category ===
        "قهوة"
    ) {

        backContent = `

            <h3>
                ${escapeHTML(
                    product.name
                )}
            </h3>


            <h4>
                إيحاءات القهوة
            </h4>


            <div class="notes">

                ${
                    product.notes.length > 0

                        ? product.notes
                            .map(note => `

                                <span>
                                    ☕
                                    ${escapeHTML(
                                        note
                                    )}
                                </span>

                            `)
                            .join("")

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
                                ${escapeHTML(
                                    product.roast
                                )}
                            </strong>
                        </p>

                      `

                    : ""

            }


            <strong>
                ${escapeHTML(
                    product.price
                )}
                ريال
            </strong>

        `;

    }


    /* =========================
       الحلا والفطور
    ========================= */

    else {

        backContent = `

            <h3>
                ${escapeHTML(
                    product.name
                )}
            </h3>


            <h4>
                المكونات
            </h4>


            <div class="ingredients">

                ${
                    product.ingredients.length > 0

                        ? product.ingredients
                            .map(item => `

                                <span>
                                    •
                                    ${escapeHTML(
                                        item
                                    )}
                                </span>

                            `)
                            .join("")

                        : `

                            <span>
                                لا توجد مكونات
                            </span>

                          `
                }

            </div>


            <strong>
                ${escapeHTML(
                    product.price
                )}
                ريال
            </strong>

        `;

    }


    /* =====================================================
       HTML البطاقة
    ===================================================== */

    wrapper.innerHTML = `

        <div class="flip-card-inner">


            <!-- FRONT -->

            <div class="flip-card-front">


                <img
                    src="${
                        product.image ||
                        "images/default.jpg"
                    }"

                    alt="${escapeHTML(
                        product.name
                    )}"

                    onerror="
                        this.onerror=null;
                        this.src='images/default.jpg';
                    "
                >


                <div class="card-content">


                    ${featuredBadge}


                    ${availabilityBadge}


                    <h3>
                        ${escapeHTML(
                            product.name
                        )}
                    </h3>


                    <p>
                        ${escapeHTML(
                            product.description ||
                            "صنف من قائمة QUAINT"
                        )}
                    </p>


                    <strong>
                        ${escapeHTML(
                            product.price
                        )}
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

                            <div class="featured-badge">
                                ⭐ الأكثر طلباً
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


    /* =====================================================
       قلب البطاقة
    ===================================================== */

    wrapper.addEventListener(
        "click",
        () => {

            wrapper.classList.toggle(
                "flipped"
            );

        }
    );


    return wrapper;

}


/* =========================================================
   حماية HTML
========================================================= */

function escapeHTML(value) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }


    return String(value)

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

}


/* =========================================================
   زر العودة للأعلى
========================================================= */

function setupTopButton() {

    if (!topButton) {
        return;
    }


    window.addEventListener(
        "scroll",
        () => {

            if (
                window.scrollY > 400
            ) {

                topButton.classList.add(
                    "show"
                );

            }

            else {

                topButton.classList.remove(
                    "show"
                );

            }

        }
    );


    topButton.addEventListener(
        "click",
        () => {

            window.scrollTo({

                top: 0,

                behavior: "smooth"

            });

        }
    );

}


/* =========================================================
   تشغيل الموقع
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        setupSearch();

        setupTopButton();

        loadMenu();

    }
);