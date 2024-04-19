module.exports = (sequelize, DataTypes) =>
    sequelize.define("user", {
        user_id: {
            type: DataTypes.STRING(300),
            primaryKey: true
        },
        username: {
            type: DataTypes.STRING(300),
            primaryKey: false
        },
        password: {
            type: DataTypes.STRING(300),
            allowNull: false
        },
        email: {
            type: DataTypes.STRING(300),
            allowNull: false
        },
        join_date: {
            type: DataTypes.STRING(300),
            allowNull: false
        },
        mfa_status: {
            type: DataTypes.BOOLEAN,
            allowNull: false
        },
        mfa_question: {
            type: DataTypes.STRING(300),
            allowNull: true
        },
        mfa_answer: {
            type: DataTypes.STRING(300),
            allowNull: true
        },
        is_del: {
            type: DataTypes.BOOLEAN,
            allowNull: false
        }
    }, {
        timestamps: false
    });

