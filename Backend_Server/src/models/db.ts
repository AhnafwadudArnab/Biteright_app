import { Sequelize } from 'sequelize';

const sequelize = new Sequelize('biteright_app', 'root', '', {
    host: '127.0.0.1',
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