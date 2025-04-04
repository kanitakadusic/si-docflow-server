// eslint-disable-next-line @typescript-eslint/no-explicit-any
module.exports = function (sequelize: any, DataTypes: any) {
	const DocumentType = sequelize.define(
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
	return DocumentType;
};
