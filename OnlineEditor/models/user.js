

module.exports = function(mongoose) {
    var Schema = mongoose.Schema;
    return mongoose.model("User", new Schema({
        username: String,
        githubId: Number,
        accessToken: String,
        displayName: String,
        emails: [ String ],
        projects: [ { type: Schema.ObjectId, ref: "Project" } ]
    }));
};
