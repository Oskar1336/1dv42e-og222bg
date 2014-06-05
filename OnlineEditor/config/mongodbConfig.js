

module.exports = function(mongoose) {
    mongoose.connect("mongodb://nodejitsu:5a15bebb24738e4d1cbdae044c57bde7@troup.mongohq.com:10067/nodejitsudb5413368681"); // public mongodb database.
    // mongoose.connect("mongodb://localhost:27017/onlineeditor"); // developing database.
};

