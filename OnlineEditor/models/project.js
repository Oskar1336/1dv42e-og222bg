

module.exports = function(mongoose) {
    var Schema = mongoose.Schema;
    return mongoose.model("Project", new Schema({
        projectName: String,
        owner: { type: Schema.Types.ObjectId, ref: "User" },
        users: [ { type: Schema.Types.ObjectId, ref: "User" } ],
        rootFolder: { type: Schema.Types.ObjectId, ref: "Folder" },
        saveToGithub: Boolean,
        githubRepoName: String,
        githubId: Number
    }));
};
