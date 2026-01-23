import { Sequelize } from 'sequelize';

const sequelize = new Sequelize('sql12815086', 'sql12815086', 'isb7WZJZ8d', {
    host: "sql12.freesqldatabase.com",
    port: 3306,
    dialect: 'mysql',
});

const testConnection = async () => {
    try {
        await sequelize.authenticate();
        console.log('Connection to the database has been established successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
};

testConnection();

export default sequelize;