// @TODO: Validation

module.exports = function(mongoose) {
    var Schema = mongoose.Schema;
    return mongoose.model("Folder", new Schema({
        folderName: String,
        files: [ { type:Schema.Types.ObjectId, ref: "File" } ],
        project: { type:Schema.Types.ObjectId, ref: "Project" },
        parent: { type:Schema.Types.ObjectId, ref: "Folder" }
    }));
};
