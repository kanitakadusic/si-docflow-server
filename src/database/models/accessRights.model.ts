module.exports = function (sequelize: any, DataTypes: any) {
	return sequelize.define(
		'access_rights',
		{
			id: {
				type: DataTypes.INTEGER,
				autoIncrement: true,
				primaryKey: true,
			},
			token: {
				type: DataTypes.TEXT,
				allowNull: true,
			},
			is_active: {
				type: DataTypes.BOOLEAN,
				defaultValue: true,
			},
		},
		{
			freezeTableName: true,
		},
	);
};
