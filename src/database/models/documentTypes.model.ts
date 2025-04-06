module.exports = function (sequelize: any, DataTypes: any) {
	return sequelize.define(
		'document_types',
		{
			name: {
				type: DataTypes.TEXT,
				allowNull: false,
			},
			description: {
				type: DataTypes.TEXT,
				allowNull: true,
			},
			created_by: {
				type: DataTypes.INTEGER,
				allowNull: true,
			},
		},
		{
			freezeTableName: true,
		},
	);
};
