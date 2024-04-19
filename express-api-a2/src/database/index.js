const {Sequelize, DataTypes} = require("sequelize");
const config = require("./config.js");

const db = {
    Op: Sequelize.Op
};

// Create Sequelize.
db.sequelize = new Sequelize(config.DB, config.USER, config.PASSWORD, {
    host: config.HOST,
    dialect: config.DIALECT
});

// Include models.
db.user = require("./models/user.js")(db.sequelize, DataTypes);
db.post = require("./models/post.js")(db.sequelize, DataTypes);
db.follow = require("./models/follow.js")(db.sequelize, DataTypes)
db.reply = require("./models/reply.js")(db.sequelize, DataTypes);
db.reaction = require("./models/reaction.js")(db.sequelize, DataTypes);

// ------------------------------------------------------------------------------ associations --------------------
// --------- Post ---------
// Relate post and user.
db.post.belongsTo(db.user, {foreignKey: {name: "user_id", allowNull: false}});

// --------- Reply ---------
db.reply.belongsTo(db.user, {foreignKey: {name: "user_id", allowNull: false}});
db.reply.belongsTo(db.post, {foreignKey: {name: "parent_post_id", allowNull: false}});
db.reply.belongsTo(db.reply, {foreignKey: {name: "parent_reply_id", allowNull: true}});


// --------- Follow ---------
db.follow.belongsTo(db.user, {foreignKey: {name: "user_id", allowNull: false}});
db.follow.belongsTo(db.user, {foreignKey: {name: "followed_user_id", allowNull: false}});


// --------- Reaction ---------
db.reaction.belongsTo(db.user, {foreignKey: {name: "user_id", allowNull: false}});
db.reaction.belongsTo(db.post, {as: 'target_post_id', foreignKey: {name: "post_id", allowNull: true}});
db.reaction.belongsTo(db.reply, {as: 'target_reply_id', foreignKey: {name: "reply_id", allowNull: true}});

// ------------------------------------------------------------------------------ associations --------------------
// Include a sync option with seed data logic included.
db.sync = async () => {
    // Sync schema.
    await db.sequelize.sync();

    // Can sync with force if the schema has become out of date - note that syncing with force is a destructive operation.
    // await db.sequelize.sync({force: true});

};

module.exports = db;
