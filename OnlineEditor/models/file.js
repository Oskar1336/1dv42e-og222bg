

module.exports = function(mongoose) {
    var Schema = mongoose.Schema;
    return mongoose.model("File", new Schema({
        filename: String,
        filePath: String,
        folder: { type:Schema.Types.ObjectId, ref: "Folder" }
    }));
};
