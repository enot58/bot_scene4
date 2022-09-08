import {Sequelize} from "sequelize";

const sequelize = new Sequelize('bot', 'root', '', {
    host: 'localhost',
    port: 3306,
    dialect: "mysql",
    define: {

    }
})

export default sequelize