

module.exports = function(mongoose) {
    var Schema = mongoose.Schema;
    var ObjectId = Schema.ObjectId;

    return mongoose.model("User", new Schema({
        username: String,
        accessToken: String
    }));
};
