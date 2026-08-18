/* =========================================
   QUAINT - MENU SCRIPT
   GitHub Pages Version
========================================= */


const menu =
    document.getElementById("menu");

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


let allProducts = [];

let currentCategory = "الكل";

let searchQuery = "";


/* =========================================
   تحميل المنيو من JSON
========================================= */

async function loadMenu() {

    try {

        const response =
            await fetch("./data/menu.json");


        if (!response.ok) {

            throw new Error(
                "Cannot load menu.json"
            );

        }


        const data =
            await response.json();


        /*
           menu.json ممكن يكون:

           Array

           أو:

           {
               items: [...]
           }
        */

        allProducts =
            Array.isArray(data)
                ? data
                : (data.items || []);


        /*
           تجهيز البيانات
        */

        allProducts =
            allProducts.map(product => {

                let image =
                    product.image || "";


                /*
                   تحويل مسار الصور
                   من:

                   /images/file.jpg

                   إلى:

                   ./images/file.jpg
                */

                if (
                    image.startsWith("/images/")
                ) {

                    image =
                        "." + image;

                }


                /*
                   إذا الصورة فارغة
                */

                if (!image) {

                    image =
                        "./images/default.jpg";

                }


                return {

                    ...product,

                    image: image,

                    notes:
                        parseJSON(
                            product.notes
                        ),

                    ingredients:
                        parseJSON(
                            product.ingredients
                        ),

                    available:
                        product.available === true ||
                        Number(
                            product.available
                        ) === 1,

                    featured:
                        product.featured === true ||
                        Number(
                            product.featured
                        ) === 1

                };

            });


        /*
           إنشاء الأقسام
        */

        createCategoryButtons();


        /*
           عرض المميز
        */

        displayFeatured();


        /*
           عرض جميع المنتجات
        */

        displayProducts("الكل");

    }


    catch (error) {

        console.error(
            "Menu Error:",
            error
        );


        menu.innerHTML = `

            <div class="empty-state">

                <div class="empty-icon">
                    ❌
                </div>

                <h3>
                    حدث خطأ في تحميل القائمة
                </h3>

                <p>
                    تعذر تحميل بيانات المنيو.
                </p>

            </div>

        `;

    }

}


/* =========================================
   تحويل JSON
========================================= */

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


        /*
           إذا كان JSON داخل JSON
        */

        if (
            typeof result === "string"
        ) {

            try {

                result =
                    JSON.parse(result);

            }

            catch {

                return [];

            }

        }


        return Array.isArray(result)
            ? result
            : [];

    }


    catch {

        return [];

    }

}


/* =========================================
   FEATURED
========================================= */

function displayFeatured() {

    const featuredProducts =
        allProducts.filter(
            product =>
                product.featured
        );


    /*
       إذا لا توجد أصناف مميزة
    */

    if (
        featuredProducts.length === 0
    ) {

        featuredSection.style.display =
            "none";

        featuredMenu.innerHTML =
            "";

        return;

    }


    /*
       إظهار القسم
    */

    featuredSection.style.display =
        "block";


    featuredMenu.innerHTML =
        "";


    /*
       ترتيب المميز
    */

    featuredProducts.sort(
        (a, b) =>
            Number(b.id || 0) -
            Number(a.id || 0)
    );


    featuredProducts.forEach(
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


/* =========================================
   الأقسام
========================================= */

function createCategoryButtons() {

    categoriesContainer.innerHTML =
        "";


    const categories = [

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


    categories.forEach(
        category => {

            const card =
                document.createElement(
                    "div"
                );


            card.classList.add(
                "category-card"
            );


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
                        .forEach(
                            item => {

                                item.classList
                                    .remove(
                                        "active"
                                    );

                            }
                        );


                    card.classList.add(
                        "active"
                    );


                    currentCategory =
                        category.name;


                    displayProducts(
                        currentCategory
                    );


                    menu.scrollIntoView({

                        behavior:
                            "smooth"

                    });

                }
            );


            categoriesContainer.appendChild(
                card
            );

        }
    );

}


/* =========================================
   عرض المنتجات + البحث
========================================= */

function displayProducts(
    category = currentCategory
) {

    currentCategory =
        category;


    menu.innerHTML =
        "";


    let products =
        [...allProducts];


    /*
       فلترة القسم
    */

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


    /*
       فلترة البحث
    */

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

                        name.includes(
                            query
                        )

                        ||

                        description.includes(
                            query
                        )

                        ||

                        categoryName.includes(
                            query
                        )

                    );

                }
            );

    }


    /*
       المميز يظهر أولًا
    */

    products.sort(
        (a, b) => {

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


            return (
                Number(b.id || 0) -
                Number(a.id || 0)
            );

        }
    );


    /*
       لا توجد نتائج
    */

    if (
        products.length === 0
    ) {

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


    /*
       حاوية المنتجات
    */

    const productsContainer =
        document.createElement(
            "div"
        );


    productsContainer.classList.add(
        "products"
    );


    /*
       إنشاء البطاقات
    */

    products.forEach(
        product => {

            const card =
                createFlipCard(
                    product,
                    false
                );


            productsContainer.appendChild(
                card
            );

        }
    );


    menu.appendChild(
        productsContainer
    );

}


/* =========================================
   البحث
========================================= */

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


/* =========================================
   بطاقة المنتج
========================================= */

function createFlipCard(
    product,
    isFeaturedSection = false
) {

    const wrapper =
        document.createElement(
            "div"
        );


    wrapper.classList.add(
        "flip-card"
    );


    /*
       غير متوفر
    */

    if (!product.available) {

        wrapper.classList.add(
            "unavailable-card"
        );

    }


    /*
       مميز
    */

    if (product.featured) {

        wrapper.classList.add(
            "featured-card"
        );

    }


    let backContent = "";


    /* =====================================
       الحالة
    ===================================== */

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


    /* =====================================
       مميز
    ===================================== */

    const featuredBadge =
        product.featured

            ? `

                <span class="featured-badge">

                    ⭐ مميز

                </span>

              `

            : "";


    /* =====================================
       القهوة
    ===================================== */

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
                            .map(
                                note => `

                                    <span>

                                        ☕

                                        ${escapeHTML(
                                            note
                                        )}

                                    </span>

                                `
                            )
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


    /* =====================================
       الحلا والفطور
    ===================================== */

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
                            .map(
                                item => `

                                    <span>

                                        •

                                        ${escapeHTML(
                                            item
                                        )}

                                    </span>

                                `
                            )
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


    /* =====================================
       البطاقة
    ===================================== */

    wrapper.innerHTML = `

        <div class="flip-card-inner">


            <!-- FRONT -->

            <div class="flip-card-front">


                <img

                    src="${escapeHTML(
                        product.image
                    )}"

                    alt="${escapeHTML(
                        product.name
                    )}"

                    onerror="
                        this.onerror=null;
                        this.src='./images/default.jpg';
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
                            ""
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


    /* =====================================
       Flip
    ===================================== */

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


/* =========================================
   تشغيل
========================================= */

setupSearch();

loadMenu();