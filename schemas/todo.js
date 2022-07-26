const mongoose = require("mongoose");

const todoSchema = mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: String,
    status: {
        type: String,
        enum: ["active", "inactive"],
    },
    date: {
        type: Date,
        default: Date.now,
    },
    user: {
        type: mongoose.Types.ObjectId,
        ref: "User"
    }
});

// static methods
todoSchema.statics = {
    findByJS: function () {
        return this.find({ title: /js/i });
    }
}

// instance methods
todoSchema.methods = {
    findActive: function () {
        return mongoose.model("Todo").find({ status: "active" });
    },
    findInActive: function () {
        return mongoose.model("Todo").find({ status: "inactive" });
    },
    findActiveCallback: function (cb) {
        return mongoose.model("Todo").find({ status: "active" }, cb);
    }
}

// query helper
todoSchema.query = {
    byLang: function (lang) {
        return this.find({ title: new RegExp(lang, "i") });
    }
}

module.exports = todoSchema;
