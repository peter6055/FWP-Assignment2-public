module.exports = (sequelize, DataTypes) =>
    sequelize.define("reply", {
        reply_id: {
            type: DataTypes.STRING(300),
            primaryKey: true
        },
        reply_text: {
            type: DataTypes.STRING(5000),
            allowNull: false
        },
        reply_time: {
            type: DataTypes.STRING(300),
            allowNull: false
        },
        is_del: {
            type: DataTypes.BOOLEAN,
            allowNull: false
        }
    }, {
        // Don't add the timestamp attributes (updatedAt, createdAt).
        timestamps: false
    });


