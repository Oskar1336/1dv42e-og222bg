

module.exports = function(mongoose) {
    var Schema = mongoose.Schema;
    return mongoose.model("User", new Schema({
        username: { type: String, index: true },
        githubId: Number,
        accessToken: { type: String, index: true },
        name: String,
        email: String,
        projects: [ { type: Schema.Types.ObjectId, ref: "Project" } ]
    }));
};
