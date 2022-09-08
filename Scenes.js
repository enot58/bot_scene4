import {session, Telegraf, Scenes, Markup} from "telegraf";
import models from "./models/models.js";
import {config} from "dotenv";
config()

const { enter, leave } = Scenes.Stage
/*
* Важно
* 1.Счётчик горячей воды
* 2.Счётчик холодной воды
*
* */



export class SceneGenerator {

    GenAdminScene () {
        const admin = new Scenes.BaseScene('admin')
        admin.enter(async (ctx) => {
            try {
                await ctx.reply('Введите пароль')
                admin.on('message', async (ctx) => {
                    const password = process.env.PASSWORD
                    const newPassword = ctx.update.message.text;
                    if (password === newPassword) {
                        await ctx.scene.enter('addHomeType')
                    } else {
                        ctx.reply('Пароль не верен')
                        await ctx.scene.reenter('admin')
                    }
                })
            } catch (e) {
                console.log(e)
            }
        })
        return admin
    }
    GenAddHomeTypeScene () {
        const addHomeType = new Scenes.BaseScene('addHomeType')
        addHomeType.enter( async (ctx) => {
            await ctx.reply('Сцена дома')
            return await ctx.reply('Выбор функции', Markup
                .keyboard([
                    ['Добавить дом'], // Row1 with 2 buttons
                    ['Добавить тип счётчика'], // Row2 with 2 buttons
                ])
                .oneTime()
                .resize()
            )
        })
        addHomeType.leave((ctx) => {
            ctx.reply('Выход')
        })
        addHomeType.hears('Добавить дом', async (ctx) => {
            await ctx.scene.enter('addHome')
        })
        addHomeType.hears('Добавить тип счётчика', async (ctx) => {
            await ctx.scene.enter('addType')
        })

        addHomeType.on('message' , (ctx) => {
            ctx.reply('Писать не надо , выбор в меню')
            ctx.scene.enter('addHomeType')
        })

        return addHomeType
    }

    GenAddHomeScene () {
        const addHome = new Scenes.BaseScene('addHome')
        addHome.enter(async (ctx) => {
            await ctx.reply('Введите название дома')
            try {
                await addHome.on('message',  async (ctx) => {
                    const nameHome = ctx.update.message.text
                    if (nameHome) {
                        await models.ObjectBuilds.create({
                            name: nameHome
                        }).then((res) => console.log(res))

                        await ctx.scene.leave()
                    } else {
                        ctx.reply('Писать не надо , выбор в меню')
                    }

                })
            } catch (e) {
                console.log(e)
            }
        })

        return addHome
    }

    GenAddTypeScene () {
        const addType = new Scenes.BaseScene('addType')
        addType.enter(async (ctx) => {
            await ctx.reply('Введите название типа')
            try {
                await addType.on('message',  async (ctx) => {
                    const nameType = ctx.update.message.text
                    models.TypeMeter.create({
                        name: nameType
                    }).then((res) => console.log(res))

                    await ctx.scene.leave()
                })
            } catch (e) {
                console.log(e)
            }
        })
        return addType
    }

    GenCheckRegistrScene () {
        const checkRegistr = new Scenes.BaseScene('checkRegistr')
        checkRegistr.enter(async (ctx) => {
            const newIdFrom = ctx.update.message.from.id
            console.log(`ID = ${newIdFrom}`)
            const newUser = await models.User.findOne({ where: { idFrom: newIdFrom } });
            if (newUser === null) {
                console.log('Пользователь не найден, создаём.....');
                await ctx.replyWithHTML('<b>Бот передаст нам информацию о ваших водосчётчиках</b> ' +
                    '\n1. Для начала в списке выбираем свой дом.' +
                    '\n2. Вводим номер квартиры(цифрами, от 0 до 9).' +
                    '\n3. Выбираем тип счётчика(холодная или горячая вода) или выходим из этого меню' +
                    '\n4. Вводим показания (Показания вводятся через точку 1.234)' +
                    '\n5. Отвечаем на вопрос переносили ли вы этот счётчик воды' +
                    '\n6. Если есть ещё счётчики нажимаем "Добавить" или выйти' +
                    '\n7. Для изменения номера или показаний нужно ввести и отправить /editmeter или выбрать в меню' +
                    '\n<b>Полученные данные будут сразу исправлены</b>\nЕсли что то не работет или есть трудности напишите пожалуйста в группу https://t.me/+YwbhN611R0M1ZmNi')
                await ctx.scene.enter('addUser')
            } else {
               /* *  Здесь выводим информацию о пользователе
                * */
                const name = ctx.update.message.from.first_name
                const lastName = ctx.update.message.from.last_name
                if (lastName === undefined) {
                    ctx.reply(`Здравствуйте, ${name} `)
                    ctx.reply('Если что то не работет или есть трудности напишите пожалуйста в группу https://t.me/+YwbhN611R0M1ZmNi')
                } else {
                    ctx.reply(`Здравствуйте, ${name} ${lastName}`)
                }


                /*TypeMeterUser.map((meters) => {
                    console.log(meters)
                })*/

                /*console.log(oldMeter)*/


                await this.ViewAllMeters(ctx)

                /*console.log(newUser instanceof models.User); // true*/
                /*ctx.scene.enter('addUser')*/
            }
        })
        return checkRegistr
    }
    GenAddNewUserScene () {
        const addUser = new Scenes.BaseScene('addUser')
        addUser.enter(async (ctx, next) => {

            try {
                await ctx.replyWithHTML('Выберите свой дом', Markup.inlineKeyboard([
                    [Markup.button.callback('Проспект победы 97', `1`)],
                    [Markup.button.callback('Мира 44Г', `2`)],
                ]))
            } catch (e) {
                console.log(e)
            }
        })

        addUser.leave(async (ctx) => {

        })

        const selectedHome = async (ctx, id) => {

            const dbHome = await models.ObjectBuilds.findOne({
                where: {
                    id: id
                }
            })

            console.log(dbHome.id)
            console.log(dbHome.name)

            const oldUser = await models.User.update({
                objectBuildId: dbHome.id
            },{
                where: {
                    idFrom: ctx.update.message.from.id
                }
            }).then((res) => {
                console.log(res)
            }).catch(e => console.log(e));

        }
        const addFlatOne = async (ctx) => {
            try {
                await addUser.on('text',  async (ctx, ) => {
                    const newIdFrom = ctx.update.message.from.id
                    const newName = ctx.update.message.from.first_name
                    const newFlat = Number(ctx.update.message.text)

                    /*console.log(newIdFrom)
                    console.log(newName)
                    console.log(newFlat)*/

                    if (newFlat && newFlat > 0 && newFlat <= 490) {
                        const newUser = models.User.build({
                            idFrom: newIdFrom,
                            name: newName,
                            numberFlat: newFlat
                        })

                        /*console.log(newUser instanceof models.User); // true
                        console.log(newName.name); // "Jane"*/

                        await newUser.save()

                        selectedHome(ctx, 1)

                        ctx.scene.enter('selectTypeMeter')
                    } else {
                        ctx.reply('Номер квартиры вводится цифрами не более 489')
                        ctx.scene.reenter('addUser')
                    }
                })
            } catch (e) {
                console.log(e)
            }

           /* return {
                state: 'done'
            }*/
        }
        const addFlatTwo = async (ctx) => {
            try {
                await addUser.on('text',  async (ctx, ) => {
                    const newIdFrom = ctx.update.message.from.id
                    const newName = ctx.update.message.from.first_name
                    const newFlat = Number(ctx.update.message.text)

                    console.log(newIdFrom)
                    console.log(newName)
                    console.log(newFlat)
                    if (newFlat && newFlat > 0) {
                        const newUser = models.User.build({
                            idFrom: newIdFrom,
                            name: newName,
                            numberFlat: newFlat,
                            questionOne: 'Нет',
                        })

                        console.log(newUser instanceof models.User); // true
                        console.log(newName.name); // "Jane"

                        await newUser.save()

                        selectedHome(ctx, 2)

                        ctx.scene.enter('questionOne')
                    } else {
                        ctx.reply('Не число')
                        ctx.scene.reenter('addUser')
                    }
                })
            } catch (e) {
                console.log(e)
            }

            return {
                state: 'done'
            }
        }



        addUser.action('1', async (ctx) => {
            await ctx.reply('Введите номер вашей квартиры')
            await addFlatOne(ctx)
        })
        addUser.action('2', async (ctx) => {
            await ctx.reply('Введите номер вашей квартиры')
            await addFlatTwo(ctx)
        })
        /*
        addUser.hears('/start', async(ctx) => {
            ctx.scene.reenter('addUSer')
        })

        addUser.hears('Выход', async(ctx) => {
            await ctx.scene.leave()
        })
        

        addUser.on( 'message',async (ctx) => {
            await ctx.reply('Нужно выбрать дом!')
            await ctx.reply('Или выход', Markup
                    .keyboard([
                        ['Выход'], // Row2 with 2 buttons
                    ])
                    .oneTime()
                    .resize())
        })
        */
        
        return addUser
    }






    GenSelectTypeMeterScene () {
        const selectTypeMeter = new Scenes.BaseScene('selectTypeMeter')
        selectTypeMeter.enter( async (ctx) => {

            const newIdFromThree = ctx.update.message.from.id
            console.log(`ID = ${newIdFromThree}`)
            const newUser = await models.User.findOne({ where: { idFrom: newIdFromThree } });

            if (newUser) {
                const typeForMarkup = await models.TypeMeter.findAll()
                typeForMarkup.map((meters) => {
                    console.log(`${meters.id} - ${meters.name}`)
                })

                await ctx.reply('Выберите тип счётчика!', Markup
                    .keyboard([
                        ['Счётчик горячей воды'], // Row1 with 2 buttons
                        ['Счётчик холодной воды'], // Row2 with 2 buttons
                        ['Выход'], // Row2 with 2 buttons
                    ])
                    .oneTime()
                    .resize())
            } else {
                await ctx.reply('Для начала введите /start \n1.Выберите свой дом\n2.Добавьте номер квартиры \n3.Добавьте счётчик.')
            }

            /*const typeForMarkup = await models.TypeMeter.findAll()
            typeForMarkup.map((meters) => {
                console.log(`${meters.id} - ${meters.name}`)
            })

            await ctx.reply('Выберите тип счётчика!', Markup
                .keyboard([
                    ['Счётчик горячей воды'], // Row1 with 2 buttons
                    ['Счётчик холодной воды'], // Row2 with 2 buttons
                    ['Выход'], // Row2 with 2 buttons
                ])
                .oneTime()
                .resize())*/
        })

        selectTypeMeter.hears('Счётчик горячей воды', (ctx) => {
            /*ctx.reply('Выбран')*/
            ctx.scene.enter('addNumberHotMeter')
        })
        selectTypeMeter.hears('Счётчик холодной воды', (ctx) => {
            /*ctx.reply('Выбран')*/
            ctx.scene.enter('addNumberCoolMeter')
        })

        selectTypeMeter.hears('Выход', (ctx) => {
            /*ctx.reply('Выбран')*/
            return ctx.scene.leave()
        })

        selectTypeMeter.on('message', (ctx) => {
            ctx.reply('Нужно выбрать')
        })

        return selectTypeMeter
    }

    GenAddNumberHotMeterScene () {
        const addNumberHotMeter = new Scenes.BaseScene('addNumberHotMeter')
        addNumberHotMeter.enter(async (ctx) => {
            await ctx.reply('Введите номер счётчика : \nНомер из 9 цифр')
        })

        addNumberHotMeter.hears(/^[0-9]+$/, async (ctx) => {
            const newNumberMeter = Number(ctx.update.message.text)
            ctx.scene.state.number = newNumberMeter
            console.log(`--------Первый стейт ${newNumberMeter}`)

            try {
                if (newNumberMeter && newNumberMeter > 0 && newNumberMeter.toString().length === 9) {
                    //Добавляем в БД номер счётчика
                    const numberMeter = await models.PropertyMeter.build({
                        number: newNumberMeter,
                        numM3: 0
                    })

                    await numberMeter.save().then((data) => {
                        console.log(data)
                    }).catch(e => console.log(e))

                    /*ctx.scene.state.number = newNumberMeter*/
                    // находим по номеру счётчика,  айди что бы передать в таблицу
                    // свойства - тип
                    const findNumberMeter = await models.PropertyMeter.findOne({
                        where: {
                            number: newNumberMeter
                        }
                    })



                    // здесь мы как раз добавляем в таблицу полученные данные
                    const newTypeProperty = await models.TypeMeterProperty.build({
                        propertyMeterId: findNumberMeter.id,
                        typeMeterId: 1
                    })
                    await newTypeProperty.save()

                    // находим пользователся по id телеграмма
                    // нужен айди что бы соотнести с таблицей
                    // пользователь - ТипСвойства счётчика
                    const userIdFrom = await models.User.findOne({
                        where: {
                            idFrom: ctx.update.message.from.id
                        }
                    })

                    console.log(userIdFrom.id)
                    // Получаем айди из таблицы
                    const findNewTypeProperty = await models.TypeMeterProperty.findOne({
                        where: {
                            propertyMeterId: findNumberMeter.id
                        }
                    })




                    // добавляем в сводную таблицу - пользователь - ТипСвойства
                    const addUserTypeProperty = await models.TypeMeterProperty_user.build({
                        userId: userIdFrom.id,
                        typeMeterPropertyId: findNewTypeProperty.id
                    })


                    await addUserTypeProperty.save().then((data) => {
                        console.log(data)
                    }).catch(e => console.log(e))

                    console.log(`--------Второй стейт ${newNumberMeter}`)
                    numberMeter.update({
                        userId:  userIdFrom.id,
                        typeMeterId: 1,
                        where: {
                            id: numberMeter.id
                        }
                    })
                    await ctx.scene.enter('addM3NumberMeter', ctx.scene.state)
                } else {
                    await ctx.reply('Требуется ввести номер (Цифрами от 0 - 9, 9 знаков)')
                    await ctx.scene.reenter('addNumberHotMeter');
                }
            } catch (e) {
                console.log(e)
                await ctx.reply('какая то ошибка')
                await ctx.scene.reenter('addNumberHotMeter');
            }

        })

        addNumberHotMeter.on('message', (ctx) => {
            ctx.reply('Нужно вводить цифрами')
        })


        return addNumberHotMeter
    }


    GenAddNumberCoolMeterScene () {
        const addNumberCoolMeter = new Scenes.BaseScene('addNumberCoolMeter')
        addNumberCoolMeter.enter(async (ctx) => {
            await ctx.reply('Введите номер счётчика : \nНомер из 9 цифр')
        })

        addNumberCoolMeter.on('text', async (ctx) => {
            const newNumberMeter = Number(ctx.update.message.text)



            try {
                if (newNumberMeter && newNumberMeter > 0 && newNumberMeter.toString().length === 9) {
                    //Добавляем в БД номер счётчика
                    const numberMeter = await models.PropertyMeter.build({
                        number: newNumberMeter
                    })

                    await numberMeter.save().then((data) => {
                        console.log(data)
                    }).catch(e => console.log(e))

                    ctx.scene.state.number = newNumberMeter
                    // находим по номеру счётчика,  айди что бы передать в таблицу
                    // свойства - тип
                    const findNumberMeter = await models.PropertyMeter.findOne({
                        where: {
                            number: newNumberMeter
                        }
                    })

                    console.log(`айди свойства - ${findNumberMeter.id}`)
                    /*console.log(`айди типа -${selectMeter.id}`)*/
                    // здесь мы как раз добавляем в таблицу полученные данные
                    const newTypeProperty = await models.TypeMeterProperty.build({
                        propertyMeterId: findNumberMeter.id,
                        typeMeterId: 1
                    })
                    await newTypeProperty.save().then((data) => {
                        console.log(data)
                    }).catch(e => console.log(e))

                    // находим пользователся по id телеграмма
                    // нужен айди что бы соотнести с таблицей
                    // пользователь - ТипСвойства счётчика
                    const userIdFrom = await models.User.findOne({
                        where: {
                            idFrom: ctx.update.message.from.id
                        }
                    })

                    console.log(userIdFrom.id)
                    // Получаем айди из таблицы
                    const findNewTypeProperty = await models.TypeMeterProperty.findOne({
                        where: {
                            propertyMeterId: findNumberMeter.id
                        }
                    })
                    /*console.log(`айди сводной таблицы - ${findNewTypeProperty.id}`)*/
                    // добавляем в сводную таблицу - пользователь - ТипСвойства
                    const addUserTypeProperty = await models.TypeMeterProperty_user.build({
                        userId: userIdFrom.id,
                        typeMeterPropertyId: findNewTypeProperty.id
                    })


                    await addUserTypeProperty.save()
                    await numberMeter.update({
                        userId:  userIdFrom.id,
                        typeMeterId: 2,
                        where: {
                            id: numberMeter.id
                        }
                    })

                    await ctx.scene.enter('addM3NumberMeter', ctx.scene.state)
                } else {
                    await ctx.reply('Требуется ввести номер (Цифрами от 0 - 9, 9 знаков)')
                    await ctx.scene.reenter('addNumberCoolMeter')
                }
            } catch (e) {
                console.log(e)
                await ctx.reply('Данный номер есть')
                await ctx.scene.reenter('addNumberCoolMeter');
            }

        })
        return addNumberCoolMeter
    }

    GenAddM3NumberMeterScene () {
        const addM3NumberMeter = new Scenes.BaseScene('addM3NumberMeter')
        addM3NumberMeter.enter(async (ctx) => {


            const {number} = ctx.scene.state
            console.log(`-----------Третий стейт ${number}`)


            await ctx.reply('Введите показания \nПоказания вводятся через точку \nНапример : 5.521');

            try {

                await addM3NumberMeter.on('text', async (ctx) => {

                    const newM3num = Number(ctx.update.message.text)
                    const {number} = ctx.scene.state
                    console.log(`----------Четвёртый стейт ${number}`)
                    if (newM3num && newM3num > 0 ) {
                        /*const oldMeterUpdate = await models.PropertyMeter.update({
                            numM3: newM3num
                        }, {
                            where: {
                                number: number
                            }
                        }).then(res => {
                            console.log(`ответ от счётчика ${res}`)
                        }).catch(e => console.log(e))*/
                        console.log(`-----------Пятый стейт ${number}`)
                        const findNumber = await models.PropertyMeter.findOne({
                            where: {
                                number: number
                            }
                        })


                        console.log(`-----------Шестой стейт ${number}`)
                        await findNumber.update({
                            numM3: newM3num
                        })




                        console.log(`-----------Седьмой стейт ${number}`)
                        /*await ctx.scene.enter('selectAction')*/
                        await ctx.scene.enter('questionOne', ctx.scene.state)
                    } else {
                        await ctx.reply('Что то не то')
                    }


                })
            } catch (e) {
                console.log(e)
                if (e) {
                    await ctx.scene.reenter('addM3NumberMeter')
                }
            }
        })


        return addM3NumberMeter
    }

    GenQuestionOneScene () {
        const questionOne = new Scenes.BaseScene('questionOne')

        questionOne.enter(async (ctx) => {
            await ctx.reply('Переносили ли вы счётчики воды ?', Markup
                .keyboard([
                    ['Да'], // Row1 with 2 buttons
                    ['Нет'], // Row2 with 2 buttons
                ])
                .oneTime()
                .resize())
        })
        questionOne.hears('Да', async (ctx) => {
            const {number} = ctx.scene.state
            const answerCtxOne = ctx.update.message.text
            try {
                await models.PropertyMeter.update({
                        question: answerCtxOne
                    },
                    {
                        where: {number: number}
                    }
                ).then((res) => {
                    console.log(res)
                }).catch((err) => {
                    console.log(err)
                })
            } catch (e) {
                console.log(e)
            }
            ctx.scene.enter('selectAction')
        })
        questionOne.hears('Нет', async (ctx) => {
            const {number} = ctx.scene.state
            const answerCtxTwo = ctx.update.message.text
            try {
                await models.PropertyMeter.update({
                        question: answerCtxTwo
                    },
                    {
                        where: {number: number}
                    }
                ).then((res) => {
                    console.log(res)
                }).catch((err) => {
                    console.log(err)
                })
            } catch (e) {
                console.log(e)
            }
            ctx.scene.enter('selectAction')
        })

        questionOne.on('message', (ctx) => {
            ctx.reply('Выберите из предложенных ответов')
        })
        return questionOne
    }

    GenSelectActionScene () {
        const selectAction = new Scenes.BaseScene('selectAction')

        selectAction.enter(async (ctx) => {
            return ctx.reply('Добавить ещё счётчики или выйти', Markup
                .keyboard([
                    ['Добавить'], // Row1 with 2 buttons
                    ['Выйти'], // Row2 with 2 buttons
                ])
                .oneTime()
                .resize())
        })
        selectAction.leave((ctx) => {
            ctx.reply('Спасибо')
        })
        selectAction.hears('Добавить', (ctx) => {
            ctx.scene.enter('selectTypeMeter')
        })
        selectAction.hears('Выйти', (ctx) => {
            ctx.scene.leave();
        })

        selectAction.on('message', (ctx) => {
            ctx.reply('Выберите из предложенных ответов')
        })

        return selectAction
    }

    ViewAllMeters (ctx) {
        const test = async (ctx) => {
            const idUser = ctx.update.message.from.id
            const viewNewMeter = await models.User.findOne({
                where: {
                    idFrom: idUser
                },
                raw: true
            })
            const typeName = await models.TypeMeter.findAll({
                raw: true
            })

            const  nObj = []
            const oldMeter = await models.PropertyMeter.findAll({
                where: {
                    userId: viewNewMeter.id
                },
                include: [
                    {
                        model: models.TypeMeter
                    }
                ],
                raw: true
            }).then( (result) => {
                result.map((meter,index) => {

                    nObj.push({
                        n: index + 1,
                        id: meter.id,
                        number: meter.number,
                        numM3: meter.numM3,
                        type: meter['type_meter.name']
                    })


                })
            } )

            /*nObj.reduce((value, item) => value.then(() => {
                console.log(`${value.n}. ${value.type} - ${value.number} (Показания :${value.numM3})`)
            } ), Promise.resolve());*/
            /*nObj.reduce((value) => {
                console.log(value)
            })*/
            await nObj.map(async (value) => {
                await ctx.reply(`${value.type} \n№ ${value.number} \nПоказания счётчика - ${value.numM3} м3`)
            })
        }
        test(ctx)
    }

    GenEditMeterScene () {
        const editMeter = new Scenes.BaseScene('editMeter')
        editMeter.enter(async (ctx, next) => {


            const newIdFromTwo = ctx.update.message.from.id
            console.log(`ID = ${newIdFromTwo}`)
            const newUser = await models.User.findOne({ where: { idFrom: newIdFromTwo } });

            if (newUser) {
                ctx.reply('Из полученного списка нужно выбрать номер счётчика')
                /*let promis = new Promise((resolve, reject) => {
                    this.ViewAllMeters(ctx)
                })*/
                await this.ViewAllMeters(ctx)



                await ctx.reply('Для выхода нажмите "Выход"', Markup
                    .keyboard([
                        ['Выход'], // Row2 with 2 buttons
                    ])
                    .oneTime()
                    .resize())
                await ctx.reply('Введите номер счётчика для редактирования')
            } else {
                await ctx.reply('Для начала введите /start \n1.Выберите свой дом\n2.Добавьте номер квартиры \n3.Добавьте счётчик. ')
            }


            /*ctx.reply('Из полученного списка нужно выбрать номер счётчика')
            /!*let promis = new Promise((resolve, reject) => {
                this.ViewAllMeters(ctx)
            })*!/
            await this.ViewAllMeters(ctx)



            await ctx.reply('Для выхода нажмите "Выход"', Markup
                .keyboard([
                    ['Выход'], // Row2 with 2 buttons
                ])
                .oneTime()
                .resize())
            await ctx.reply('Введите номер счётчика для редактирования')*/
        })



        editMeter.hears(/^[0-9]+$/, async(ctx) => {

            const numberMeters = Number(ctx.message.text)

            ctx.scene.state.numbermeter = numberMeters

            if (numberMeters && numberMeters.toString().length === 9 && numberMeters > 0) {
                /*
                * Сначала ищем по номеру счётчика поле
                * проверяем принадлежит ли он этому пользователю
                * далее выводим вопрос по изменению
                * */
                const idUserMeter = await models.User.findOne({
                    where: {
                        idFrom: ctx.update.message.from.id
                    },
                    raw: true
                })
                console.log(idUserMeter.id)
                const numberHaveMeter = await models.PropertyMeter.findOne({
                    where: {
                        number: numberMeters
                    },
                    raw: true
                }).then(data => {
                    if (data.userId === idUserMeter.id) {
                        return ctx.scene.enter('editNumberM3Meter', ctx.scene.state)
                    } else {
                        ctx.reply('Не ваш счётчик')
                    }
                }).catch(err => console.log(err))


            } else {
                await ctx.reply('Нужно вводить 9 знаков цифрами')
                await ctx.scene.enter('editMeter')
            }
        })

        editMeter.hears('Выход', async (ctx) => {
            await ctx.scene.leave()
        })

        editMeter.leave(async (ctx) => {

        })


        return editMeter
    }

    GenViewMeterScene () {
        const viewMeter = new Scenes.BaseScene('viewMeter')
        viewMeter.enter(async (ctx) => {
            const newIdFrom = ctx.update.message.from.id
            console.log(`ID = ${newIdFrom}`)
            const newUser = await models.User.findOne({ where: { idFrom: newIdFrom } });

            if (newUser) {
                this.ViewAllMeters(ctx)
                await ctx.scene.leave()
            } else {
                await ctx.reply('Для начала введите /start \n1.Выберите свой дом\n2.Добавьте номер квартиры \n3.Добавьте счётчик.')
            }
        })

        return viewMeter
    }


    GenEditNumberM3MeterScene () {
        const editNumberM3Meter = new Scenes.BaseScene('editNumberM3Meter')

        editNumberM3Meter.enter(async (ctx) => {
            await ctx.reply('Выберите действие :', Markup
                .keyboard([
                    ['Изменить номер'], // Row1 with 2 buttons
                    ['Изменить показания'], // Row2 with 2 buttons
                    ['Выход'], // Row2 with 2 buttons
                ])
                .oneTime()
                .resize())
        })

        editNumberM3Meter.hears('Изменить номер', (ctx) => {
            /*ctx.reply('Выбран')*/
            ctx.scene.enter('editNumberMeter', ctx.scene.state)
        })
        editNumberM3Meter.hears('Изменить показания', (ctx) => {
            /*ctx.reply('Выбран')*/
            ctx.scene.enter('editM3Meter', ctx.scene.state)
        })

        editNumberM3Meter.hears('Выход', (ctx) => {
            /*ctx.reply('Выбран')*/
            return ctx.scene.leave()
        })

        editNumberM3Meter.on('message', (ctx) => {
            ctx.reply('Нужно выбрать из предложенных действий')
        })

        return editNumberM3Meter
    }



    GenEditNumberMeterScene () {
        const editNumberMeter = new Scenes.BaseScene('editNumberMeter')

        editNumberMeter.enter(async (ctx) => {


            await ctx.reply('Введите новый номер')

        })

        editNumberMeter.hears(/^[0-9]+$/, async (ctx) => {
            const {numbermeter} = ctx.scene.state
            const newNumber = ctx.update.message.text
            console.log(newNumber)
            const bdNumberMeter = await models.PropertyMeter.findOne({
                where: {
                    number: numbermeter
                },
                raw: true

            })

            const editOldNumberMeter = await models.PropertyMeter.update({
                number: newNumber,
            },{
                where: {
                    id: bdNumberMeter.id
                }
            })


           await ctx.reply('Номер изменён')
            await ctx.scene.enter('editMeter')
        })

        editNumberMeter.on('text', async (ctx) => {
            ctx.reply('Не верно указан номер')
        })

        return editNumberMeter
    }

    GenEditM3MeterScene () {
        const editM3Meter = new Scenes.BaseScene('editM3Meter')

        editM3Meter.enter(async (ctx) => {
            const {numbermeter} = ctx.scene.state

            await ctx.reply('Введите новыe показания')

        })


        editM3Meter.hears(/^[0.0-9.0]+$/, async (ctx) => {
            const {numbermeter} = ctx.scene.state

            const m3Meter = ctx.update.message.text
            const bdM3Meter = await models.PropertyMeter.findOne({
                where: {
                    number: numbermeter
                },
                raw: true
            })

            const editOldM3Meter = await models.PropertyMeter.update({
                numM3: m3Meter,
            }, {
                where: {
                    id: bdM3Meter.id
                }
            })

            await ctx.reply('Показания изменены');

            await ctx.scene.enter('editMeter')
        })

        editM3Meter.on('message', async (ctx) => {
            ctx.reply('Не верно показания')
        })


        return editM3Meter
    }


    GenAddCommentScene () {
        const addComment = new Scenes.BaseScene('addComment')
        addComment.enter(async (ctx) => {

            const newIdFromFive = ctx.update.message.from.id
            console.log(`ID = ${newIdFromFive}`)
            const newUser = await models.User.findOne({ where: { idFrom: newIdFromFive } });

            if (newUser) {
                await ctx.reply('Введите ваше обращение(заявку) \nМожно оставить свой номер телефона , если будут вопросы с вами свяжутся.')
            } else {
                await ctx.reply('Для начала введите /start \n1.Выберите свой дом\n2.Добавьте номер квартиры')
            }


            /*await ctx.reply('Введите ваше обращение(заявку)')*/

        })

        addComment.on('message', async (ctx) => {
            const findUserId = await models.User.findOne({
                where: {
                    idFrom: ctx.message.from.id
                }
            })
            const userId = findUserId.id
            const newComment = await models.Comment.build({
                commentText: ctx.update.message.text,
                userId: findUserId.id
            })

            await newComment.save()
            await ctx.reply('Отправлено')
        })




        return addComment
    }

}
