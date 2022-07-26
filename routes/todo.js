const express = require("express");
const mongoose = require("mongoose");
const checkLogin = require('../middleware/checkLogin');
const router = express.Router();
const todoSchema = require("../schemas/todo");
const userSchema = require("../schemas/user");
const Todo = new mongoose.model("Todo", todoSchema);
const User = new mongoose.model("User", userSchema);

// GET ALL THE TODOS
router.get("/", checkLogin, (req, res) => {
    // Todo.find({ status: "active" })
    Todo.find({})
        // .populate("user")
        // .populate("user", "name username")
        .populate("user", "name username -_id")
        .select({
            _id: 0,
            _v: 0,
            date: 0,
        })
        // .limit(2)
        .exec((err, data) => {
            if (err) {
                res.status(500).json({
                    error: "There was a server side error!",
                });
            } else {
                // res.status(200).json({
                //     result: data,
                //     message: "Success",
                // });
                res.status(200).send(data);
            }
        });
});

// GET ALL ACTIVE TODOS
router.get("/active", async (req, res) => {
    try {
        const todo = new Todo();
        const data = await todo.findActive();

        res.status(200).json(data);
        // res.status(200).json({ data });
    } catch (error) {
        res.status(500).json({ error: "server-side error occurs" });
    }
})

// GET ALL INACTIVE TODOS
router.get("/inactive", async (req, res) => {
    try {
        const todo = new Todo();
        const data = await todo.findInActive();

        res.status(200).json(data);
        // res.status(200).json({ data });
    } catch (error) {
        res.status(500).json({ error: "server-side error occurs" });
    }
})

// GET ALL ACTIVE TODOS USING CALLBACK
router.get("/active-callback", (req, res) => {
    const todo = new Todo();
    todo.findActiveCallback((err, data) => {
        // res.status(200).json(data);
        res.status(200).json({ data });
    })
})

// GET ACTIVE TODOS with callback
router.get("/active-callback", (req, res) => {
    const todo = new Todo();
    todo.findActiveCallback((err, data) => {
        res.status(200).json({
            data,
        });
    });
});

// GET JS KEYWORD BASED TITLE
router.get("/js", async (req, res) => {
    const data = await Todo.findByJS();
    res.status(200).json({
        data,
    });
});

// GET TODOS BY LANGUAGE
router.get("/language", async (req, res) => {
    const data = await Todo.find().byLang("js");
    res.status(200).json(data);
});

// GET A TODO by ID
router.get("/:id", async (req, res) => {
    try {
        const data = await Todo.find({ _id: req.params.id });
        res.status(200).json({
            result: data,
            message: "Success",
        });
    } catch (err) {
        res.status(500).json({
            error: "There was a server side error!",
        });
    }
});

// POST A TODO
router.post("/", checkLogin, async (req, res) => {
    const newTodo = new Todo({
        ...req.body,
        user: req.userID
    });

    try {
        const todo = await newTodo.save();
        await User.updateOne(
            {
                _id: req.userID
            },
            {
                $push: {
                    todos: todo._id
                }
            }
        )

        res.status(200).json({ success: "todo addition successful" })
    } catch (error) {
        res.status(500).json({ error: "server-side error" })
    }
});

// POST MULTIPLE TODO
router.post("/all", (req, res) => {
    Todo.insertMany(req.body, (err) => {
        if (err) {
            res.status(500).json({
                error: "There was a server side error!",
            });
        } else {
            res.status(200).json({
                message: "Todos were inserted successfully!",
            });
        }
    });
});

// PUT TODO
router.put("/:id", (req, res) => {
    const result = Todo.findByIdAndUpdate(
        { _id: req.params.id },
        {
            $set: {
                status: "active",
            },
        },
        {
            new: true,
            useFindAndModify: false,
        },
        (err) => {
            if (err) {
                res.status(500).json({
                    error: "There was a server side error!",
                });
            } else {
                res.status(200).json({
                    message: "Todo was updated successfully!",
                });
            }
        }
    );
    console.log(result);
});

// DELETE TODO
router.delete("/:id", (req, res) => {
    Todo.deleteOne({ _id: req.params.id }, (err) => {
        if (err) {
            res.status(500).json({
                error: "There was a server side error!",
            });
        } else {
            res.status(200).json({
                message: "Todo was deleted successfully!",
            });
        }
    });
});

module.exports = router;
