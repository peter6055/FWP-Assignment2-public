module.exports = (sequelize, DataTypes) =>
    sequelize.define("follow", {

    }, {
        // Don't add the timestamp attributes (updatedAt, createdAt).
        timestamps: false
    });


