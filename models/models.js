import sequelize from "../db.js";
import { Sequelize } from "sequelize";

/*
*  Здесь пользователь с именем, и квартирой (так же добавляем idFrom из ctx.message)
* */
class User extends Sequelize.Model {}
User.init({
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
    },
    idFrom: {
        type: Sequelize.BIGINT,
        allowNull: false
    },
    name: {
        type: Sequelize.STRING,
        allowNull: false
    },
    numberFlat: {
        type: Sequelize.INTEGER,
        allowNull: false
    }
}, {
    sequelize, modelName: "users"/*, timestamps: true, createdAt: true*/
})


class Comment extends Sequelize.Model {}
Comment.init({
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
    },
    commentText: {
        type: Sequelize.STRING,
        allowNull: true
    },
},{
    sequelize, modelName: "comment"
})
class UserComment extends Sequelize.Model {}

UserComment.init(
    {
        id: {
            type: Sequelize.INTEGER,
            primaryKey :true,
            autoIncrement: true,
            allowNull: false
        },
    },
    {
        sequelize, modelName: 'user_comment'/*, timestamps: true, createdAt: true*/
    }
)
User.belongsToMany(Comment, {through: UserComment})
Comment.belongsToMany(User, {through: UserComment})




Comment.belongsTo(User)
User.hasMany(Comment)

/*
*  Здесь добавлены объекты
*  добавляет только администратор
* */

class ObjectBuilds extends Sequelize.Model {}
ObjectBuilds.init({
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    name: {
        type: Sequelize.STRING,

        allowNull: false
    }
},{
    sequelize, modelName: "object_builds"/*, timestamps: true, createdAt: true*/
})
/*
*  Делаем связь у одного объекта много пользователей
*  Много пользователей - Один объект
*  Один объект - много пользователей
*  Таблица связи user_objectbuilds
* */
User.belongsTo(ObjectBuilds)
ObjectBuilds.hasMany(User)

/*
* Типы счётчиков , добавляет долько админ
* */
class TypeMeter extends Sequelize.Model {}
TypeMeter.init (
    {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false
        },
        name: {
            type: Sequelize.STRING,
            allowNull: false
        }
    },
    {
        sequelize, modelName: "type_meter"/*, timestamps: true, createdAt: true*/
    }
)




/*
*  Добавляем свойства счётчика (номер и показания)
* */
class PropertyMeter extends Sequelize.Model {}
PropertyMeter.init(
    {
        id: {
            type: Sequelize.INTEGER,
            primaryKey :true,
            autoIncrement: true,
            allowNull: false
        },
        number: {
            type: Sequelize.INTEGER,
            allowNull: false,
        },
        numM3: {
            type: Sequelize.FLOAT,
            allowNull: true

        },
        question: {
            type: Sequelize.STRING,
            allowNull: false,
            defaultValue: 'Нет'
        },
        /*userId*/
        /*typeId*/
    },
    {
        sequelize, modelName: 'property_meter'/*, timestamps: true, createdAt: true*/
    }
)
/*User.belongsTo(ObjectBuilds)
ObjectBuilds.hasMany(User)*/

PropertyMeter.belongsTo(User)
User.hasMany(PropertyMeter)

PropertyMeter.belongsTo(TypeMeter)
TypeMeter.hasMany(PropertyMeter)


/*
*  Добавляем таблицу для связи свойств счётчика и типа
* */

class TypeMeterProperty extends Sequelize.Model {}

TypeMeterProperty.init(
    {
        id: {
            type: Sequelize.INTEGER,
            primaryKey :true,
            autoIncrement: true,
            allowNull: false
        },
    },
    {
        sequelize, modelName: 'typeMeter_property'/*, timestamps: true, createdAt: true*/
    }
)
PropertyMeter.belongsToMany(TypeMeter, {through: TypeMeterProperty})
TypeMeter.belongsToMany(PropertyMeter, {through: TypeMeterProperty})



/*
* Таблица для связи много ко многим
* */

class TypeMeterProperty_user extends Sequelize.Model {}

TypeMeterProperty_user.init(
    {
        id: {
            type: Sequelize.INTEGER,
            primaryKey :true,
            autoIncrement: true,
            allowNull: false
        },
    },
    {
        sequelize, modelName: 'typeMeterProperty_user'/*, timestamps: true, createdAt: true*/
    }
)
User.belongsToMany(TypeMeterProperty, {through: TypeMeterProperty_user})
TypeMeterProperty.belongsToMany(User, {through: TypeMeterProperty_user})





/*class UserObjectBuilds extends Sequelize.Model {}

UserObjectBuilds.init(
    {
        id: {
            type: Sequelize.INTEGER,
            primaryKey :true,
            autoIncrement: true,
            allowNull: false
        },
    },
    {
        sequelize, modelName: 'user_objectbuilds', timestamps: true, createdAt: true
    }
)*/


export default {User, ObjectBuilds, TypeMeter, PropertyMeter, TypeMeterProperty, TypeMeterProperty_user, UserComment, Comment}
