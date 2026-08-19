const express = require("express");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const db = require("./database");

const app = express();
const PORT = 4000;


/* ==================================================
   UPLOAD IMAGES
================================================== */

const storage = multer.diskStorage({

    destination: (req, file, cb) => {

        cb(
            null,
            path.join(__dirname, "public", "images")
        );

    },

    filename: (req, file, cb) => {

        const uniqueName =
            Date.now() + "-" + file.originalname;

        cb(null, uniqueName);

    }

});

const upload = multer({
    storage: storage
});


/* ==================================================
   MIDDLEWARE
================================================== */

app.use(
    express.static(
        path.join(__dirname, "public")
    )
);

app.use(
    "/admin",
    express.static(
        path.join(__dirname, "admin")
    )
);

app.use(express.json());


/* ==================================================
   ADMIN DASHBOARD
================================================== */

app.get("/admin", (req, res) => {

    res.sendFile(
        path.join(
            __dirname,
            "admin",
            "index.html"
        )
    );

});


/* ==================================================
   OLD MENU JSON
================================================== */

app.get("/api/menu", (req, res) => {

    const filePath =
        path.join(
            __dirname,
            "data",
            "menu.json"
        );

    fs.readFile(
        filePath,
        "utf8",
        (err, data) => {

            if (err) {

                console.error(
                    "Error reading menu.json:",
                    err
                );

                return res.status(500).json({
                    error:
                        "Cannot read menu.json"
                });

            }

            try {

                const menu =
                    JSON.parse(data);

                res.json(menu);

            } catch (error) {

                console.error(
                    "JSON Error:",
                    error
                );

                res.status(500).json({
                    error:
                        "Invalid JSON"
                });

            }

        }
    );

});


/* ==================================================
   ALL MENU ITEMS FROM SQLITE
================================================== */

app.get("/api/menu-db", (req, res) => {

    db.all(
        `
        SELECT *
        FROM menu_items
        ORDER BY id DESC
        `,
        [],
        (err, rows) => {

            if (err) {

                console.error(
                    "Database error:",
                    err
                );

                return res.status(500).json({
                    error:
                        "Cannot read database"
                });

            }

            res.json({
                items: rows
            });

        }
    );

});


/* ==================================================
   MOST ORDERED / FEATURED ITEMS
================================================== */

/*
   الأصناف التي يتم تحديدها من لوحة التحكم
   على أنها Featured
   ستظهر في قسم "الأكثر طلبًا"
*/

app.get(
    "/api/menu-db/featured",
    (req, res) => {

        db.all(
            `
            SELECT *
            FROM menu_items
            WHERE featured = 1
            AND available = 1
            ORDER BY id DESC
            `,
            [],
            (err, rows) => {

                if (err) {

                    console.error(
                        "Featured items error:",
                        err
                    );

                    return res.status(500).json({
                        error:
                            "Cannot read most ordered items"
                    });

                }

                res.json({
                    items: rows
                });

            }
        );

    }
);


/* ==================================================
   FIX MENU DATA
================================================== */

app.get("/api/fix-menu", (req, res) => {

    db.all(
        `
        SELECT
            id,
            notes,
            ingredients
        FROM menu_items
        `,
        [],
        (err, rows) => {

            if (err) {

                return res.status(500).json({
                    error: err.message
                });

            }

            rows.forEach(item => {

                let notes =
                    item.notes || "[]";

                let ingredients =
                    item.ingredients || "[]";


                /* =========================
                   NOTES
                ========================= */

                try {

                    notes =
                        JSON.parse(notes);

                    if (
                        typeof notes ===
                        "string"
                    ) {

                        notes =
                            JSON.parse(notes);

                    }

                } catch {

                    notes = [];

                }


                /* =========================
                   INGREDIENTS
                ========================= */

                try {

                    ingredients =
                        JSON.parse(
                            ingredients
                        );

                    if (
                        typeof ingredients ===
                        "string"
                    ) {

                        ingredients =
                            JSON.parse(
                                ingredients
                            );

                    }

                } catch {

                    ingredients = [];

                }


                /* =========================
                   UPDATE
                ========================= */

                db.run(
                    `
                    UPDATE menu_items

                    SET
                        notes = ?,
                        ingredients = ?

                    WHERE id = ?
                    `,
                    [
                        JSON.stringify(notes),
                        JSON.stringify(
                            ingredients
                        ),
                        item.id
                    ]
                );

            });


            res.json({

                message:
                    "تم تنظيف بيانات المنيو بنجاح ✅"

            });

        }
    );

});


/* ==================================================
   ADD MENU ITEM
================================================== */

app.post(
    "/api/menu-db",
    upload.single("image"),
    (req, res) => {

        const {
            name,
            description,
            price,
            category,
            notes,
            roast,
            ingredients
        } = req.body;


        const image =
            req.file
                ? `/images/${req.file.filename}`
                : "";


        const parsedNotes =
            notes || "[]";

        const parsedIngredients =
            ingredients || "[]";


        const sql = `
            INSERT INTO menu_items
            (
                name,
                description,
                price,
                category,
                image,
                notes,
                roast,
                ingredients
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;


        db.run(
            sql,
            [
                name,
                description,
                price,
                category,
                image,
                parsedNotes,
                roast || "",
                parsedIngredients
            ],
            function (err) {

                if (err) {

                    console.error(
                        "Insert error:",
                        err
                    );

                    return res.status(500).json({
                        error:
                            "Cannot add menu item"
                    });

                }


                res.json({

                    message:
                        "Item added successfully",

                    id:
                        this.lastID

                });

            }
        );

    }
);


/* ==================================================
   UPDATE AVAILABILITY
================================================== */

app.put(
    "/api/menu-db/:id/availability",
    (req, res) => {

        const id =
            req.params.id;

        const {
            available
        } = req.body;


        db.run(
            `
            UPDATE menu_items

            SET available = ?

            WHERE id = ?
            `,
            [
                available ? 1 : 0,
                id
            ],
            function (err) {

                if (err) {

                    console.error(
                        "Availability error:",
                        err
                    );

                    return res.status(500).json({
                        error:
                            "Cannot update availability"
                    });

                }


                if (this.changes === 0) {

                    return res.status(404).json({
                        error:
                            "Item not found"
                    });

                }


                res.json({

                    message:
                        "Availability updated",

                    available:
                        available ? 1 : 0

                });

            }
        );

    }
);


/* ==================================================
   MOST ORDERED / FEATURED STATUS
================================================== */

/*
   من لوحة التحكم:
   featured = true
   يعني يظهر في قسم "الأكثر طلبًا"
*/

app.put(
    "/api/menu-db/:id/featured",
    (req, res) => {

        const id =
            req.params.id;

        const featured =
            req.body.featured
                ? 1
                : 0;


        db.run(
            `
            UPDATE menu_items

            SET featured = ?

            WHERE id = ?
            `,
            [
                featured,
                id
            ],
            function (err) {

                if (err) {

                    console.error(
                        "Featured update error:",
                        err
                    );

                    return res.status(500).json({
                        error:
                            "Cannot update most ordered status"
                    });

                }


                if (this.changes === 0) {

                    return res.status(404).json({
                        error:
                            "Item not found"
                    });

                }


                res.json({

                    message:
                        "Most ordered status updated",

                    featured:
                        featured

                });

            }
        );

    }
);


/* ==================================================
   DELETE MENU ITEM
================================================== */

app.delete(
    "/api/menu-db/:id",
    (req, res) => {

        const id =
            req.params.id;


        db.run(
            `
            DELETE FROM menu_items
            WHERE id = ?
            `,
            [id],
            function (err) {

                if (err) {

                    console.error(
                        "Delete error:",
                        err
                    );

                    return res.status(500).json({
                        error:
                            "Cannot delete menu item"
                    });

                }


                if (this.changes === 0) {

                    return res.status(404).json({
                        error:
                            "Item not found"
                    });

                }


                res.json({

                    message:
                        "Item deleted successfully"

                });

            }
        );

    }
);


/* ==================================================
   UPDATE MENU ITEM
================================================== */

app.put(
    "/api/menu-db/:id",
    upload.single("image"),
    (req, res) => {

        const id =
            req.params.id;


        const {
            name,
            description,
            price,
            category,
            notes,
            roast,
            ingredients
        } = req.body;


        const image =
            req.file
                ? `/images/${req.file.filename}`
                : req.body.image || "";


        const sql = `
            UPDATE menu_items

            SET

                name = ?,

                description = ?,

                price = ?,

                category = ?,

                image = ?,

                notes = ?,

                roast = ?,

                ingredients = ?

            WHERE id = ?
        `;


        db.run(
            sql,
            [
                name,
                description,
                price,
                category,
                image,
                notes || "[]",
                roast || "",
                ingredients || "[]",
                id
            ],
            function (err) {

                if (err) {

                    console.error(
                        "Update error:",
                        err
                    );

                    return res.status(500).json({
                        error:
                            "Cannot update menu item"
                    });

                }


                if (this.changes === 0) {

                    return res.status(404).json({
                        error:
                            "Item not found"
                    });

                }


                res.json({

                    message:
                        "Item updated successfully"

                });

            }
        );

    }
);


/* ==================================================
   DATABASE TEST
================================================== */

app.get("/test-db", (req, res) => {

    res.send(
        "DATABASE API TEST WORKS!"
    );

});


/* ==================================================
   START SERVER
================================================== */

app.listen(
    PORT,
    () => {

        console.log(
            `Server running at http://localhost:${PORT}`
        );

    }
);