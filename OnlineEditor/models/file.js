

module.exports = function(mongoose) {
    var Schema = mongoose.Schema;
    return mongoose.model("File", new Schema({
        name: String,
        type: String,
        content: [String],
        folder: { type:Schema.Types.ObjectId, ref: "Folder" },
        githubPath: String
    }));
};
