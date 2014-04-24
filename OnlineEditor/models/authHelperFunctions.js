

var S = require("string");

module.exports = {
    checkIfAuthenticated: function(req, res, next) {
        if (req.isAuthenticated()) {
            return next();
        }
        res.status(401);
        res.send("Not authenticated");
    },
    checkIfUserIsAuthorized: function (currentUser, projectUsers) {
        for (var i = 0; i < projectUsers.length; i++) {
            if (S(projectUsers[i]).s === S(currentUser._id).s) {
                return true;
            }
        }
        return false;
    },
    checkIfUserIsPartOfProject: function(currentUser, projectUsers) {
        for (var i = 0; i < projectUsers.length; i++) {
            if (S(projectUsers[i]._id).s === S(currentUser._id).s) {
                return true;
            }
        }
        return false;
    },
    findProjectAndValidateUser: function(currentUser, projectId, models) {
        var that = this;
        var valid = true;
        models.Project.findById(projectId).populate("users").exec(function(err, project) {
            valid = that.checkIfUserIsPartOfProject(currentUser, project.users);
        });
        return valid;
    }
};
