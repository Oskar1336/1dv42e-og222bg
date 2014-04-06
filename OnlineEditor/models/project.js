

module.exports = function(mongoose) {
    var Schema = mongoose.Schema;
    return mongoose.model("Project", new Schema({
        projectName: String,
        users: [ { type: Schema.ObjectId, ref: "User" } ]
    }));
};
