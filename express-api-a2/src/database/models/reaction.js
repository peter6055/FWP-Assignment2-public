module.exports = (sequelize, DataTypes) =>
    sequelize.define("reaction", {
        id: {
            type: DataTypes.STRING(300),
            primaryKey: true,
            allowNull: false
        },
        reaction: {
            type: DataTypes.INTEGER,
            allowNull: false
        }
    }, {
        // Don't add the timestamp attributes (updatedAt, createdAt).
        timestamps: false
    });


