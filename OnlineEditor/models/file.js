

module.exports = function(mongoose) {
    return mongoose.model("File", new mongoose.Schema({
        filename: String,
        filePath: String
    }));
};
