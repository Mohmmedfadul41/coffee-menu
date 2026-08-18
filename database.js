const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("./data/coffee.db", (err) => {

    if (err) {

        console.error(
            "Database error:",
            err.message
        );

    } else {

        console.log(
            "SQLite database connected!"
        );

    }

});


/* =====================================
   إنشاء جدول المنيو
===================================== */

db.run(`
    CREATE TABLE IF NOT EXISTS menu_items (

        id INTEGER PRIMARY KEY AUTOINCREMENT,

        name TEXT NOT NULL,

        description TEXT,

        price REAL NOT NULL,

        category TEXT NOT NULL,

        image TEXT,

        notes TEXT,

        roast TEXT,

        ingredients TEXT,

        available INTEGER DEFAULT 1,

        featured INTEGER DEFAULT 0

    )
`, (err) => {

    if (err) {

        console.error(
            "Table error:",
            err.message
        );

        return;

    }

    console.log(
        "menu_items table ready!"
    );


    /* =====================================
       فحص الأعمدة الموجودة
    ===================================== */

    db.all(
        "PRAGMA table_info(menu_items)",
        [],
        (err, columns) => {

            if (err) {

                console.error(
                    "Column check error:",
                    err.message
                );

                return;

            }


            /* =====================================
               فحص available
            ===================================== */

            const hasAvailable =
                columns.some(
                    column =>
                        column.name === "available"
                );


            if (!hasAvailable) {

                db.run(
                    `
                    ALTER TABLE menu_items
                    ADD COLUMN available INTEGER DEFAULT 1
                    `,
                    (err) => {

                        if (err) {

                            console.error(
                                "Available migration error:",
                                err.message
                            );

                        } else {

                            console.log(
                                "available column added!"
                            );

                        }

                    }
                );

            } else {

                console.log(
                    "available column already exists!"
                );

            }


            /* =====================================
               فحص featured
            ===================================== */

            const hasFeatured =
                columns.some(
                    column =>
                        column.name === "featured"
                );


            if (!hasFeatured) {

                db.run(
                    `
                    ALTER TABLE menu_items
                    ADD COLUMN featured INTEGER DEFAULT 0
                    `,
                    (err) => {

                        if (err) {

                            console.error(
                                "Featured migration error:",
                                err.message
                            );

                        } else {

                            console.log(
                                "featured column added!"
                            );

                        }

                    }
                );

            } else {

                console.log(
                    "featured column already exists!"
                );

            }

        }
    );

});


module.exports = db;