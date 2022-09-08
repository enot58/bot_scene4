import {session, Telegraf, Scenes, Markup} from "telegraf";
import {config} from "dotenv";
import sequelize from "./db.js";
import models from "./models/models.js"
config()
/*
* Подключение к базе данных
* */
const connectBase = async () => {
    try {
        await sequelize.authenticate()
        console.log('Соединение с БД было успешно установлено')
    } catch (e) {
        console.log('Невозможно выполнить подключение к БД: ', e)
    }
}
connectBase()
await sequelize.sync({force: false});


import {SceneGenerator} from "./Scenes.js";

const doneScene = new SceneGenerator()
const adminScene = doneScene.GenAdminScene()
const addHomeTypeScene = doneScene.GenAddHomeTypeScene()
const addHomeScene = doneScene.GenAddHomeScene()
const addTypeScene = doneScene.GenAddTypeScene()
const checkRegistrScene = doneScene.GenCheckRegistrScene()
const addUserScene = doneScene.GenAddNewUserScene()
const questionOneScene = doneScene.GenQuestionOneScene()
const selectTypeMeterScene = doneScene.GenSelectTypeMeterScene()
const addNumberHotMeterScene = doneScene.GenAddNumberHotMeterScene()
const addNumberCoolMeterScene = doneScene.GenAddNumberCoolMeterScene()
const addM3NumberMeterScene = doneScene.GenAddM3NumberMeterScene()
const selectActionScene = doneScene.GenSelectActionScene()
const editMeterScene = doneScene.GenEditMeterScene()
const viewMeterScene = doneScene.GenViewMeterScene()
const editNumberM3MeterScene = doneScene.GenEditNumberM3MeterScene()
const editNumberMeterScene = doneScene.GenEditNumberMeterScene()
const editM3MeterScene = doneScene.GenEditM3MeterScene()
const addCommentScene = doneScene.GenAddCommentScene()




const bot = new Telegraf(process.env.BOT_TOKEN)

const stage = new Scenes.Stage([adminScene, addHomeTypeScene, addHomeScene, addTypeScene, checkRegistrScene, addUserScene, questionOneScene, selectTypeMeterScene,addNumberHotMeterScene, addNumberCoolMeterScene,addM3NumberMeterScene, selectActionScene, editMeterScene, viewMeterScene, editNumberM3MeterScene, editNumberMeterScene, editM3MeterScene, addCommentScene], {
    ttl: 100
})

const { enter, leave } = Scenes.Stage

bot.use(session())
bot.use(stage.middleware())



bot.start(async (ctx) => {

    await ctx.scene.enter('checkRegistr')
    /*ctx.scene.enter('addNumberHotMeter')*/
})
bot.help(async (ctx) => {
    await ctx.replyWithHTML('<b>Бот передаст нам информацию о ваших водосчётчиках</b> ' +
        '\n1. Для начала в списке выбираем свой дом.' +
        '\n2. Вводим номер квартиры(цифрами, от 0 до 9).' +
        '\n3. Выбираем тип счётчика(холодная или горячая вода) или выходим из этого меню' +
        '\n4. Вводим показания (Показания вводятся через точку 1.234)' +
        '\n5. Отвечаем на вопрос переносили ли вы этот счётчик воды' +
        '\n6. Если есть ещё счётчики нажимаем "Добавить" или выйти' +
        '\n7. Для изменения номера или показаний нужно ввести и отправить /editmeter или выбрать в меню' +
        '\n<b>Полученные данные будут сразу исправлены</b>')
})
bot.command('info',async (ctx) => {
    await ctx.replyWithHTML('<b>Информация о компании</b> ' +
        '\nНаш сайт: <a>http://stroy-es.ru</a>' +
        '\nНаш телефон: 8(8412)456-607' +
        '\n')
})


bot.command('admin', async (ctx) => {
    await ctx.scene.enter('admin')
})
bot.command('viewmeter', async (ctx) => {
    await ctx.scene.enter('viewMeter')
})
bot.command('addmeter', async (ctx) => {
    await ctx.scene.enter('selectTypeMeter')
})
bot.command('editmeter', async (ctx) => {
    await ctx.scene.enter('editMeter')
})

bot.command('send', async (ctx) => {
    await ctx.scene.enter('addComment')
})

bot.launch()

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))