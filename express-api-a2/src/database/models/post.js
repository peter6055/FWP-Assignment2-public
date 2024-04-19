module.exports = (sequelize, DataTypes) =>
    sequelize.define("post", {
        post_id: {
            type: DataTypes.STRING(300),
            primaryKey: true

        }, post_text: {
            type: DataTypes.STRING(5000),
            allowNull: false

        }, post_img: {
            type: DataTypes.STRING(5000),
            allowNull: true

        }, post_time: {
            type: DataTypes.STRING(300),
            allowNull: false
        },
        is_del: {
            type: DataTypes.BOOLEAN,
            allowNull: false
        }
    }, {
        // Don't add the timestamp attributes (updatedAt, createdAt).
        timestamps: true
    });


