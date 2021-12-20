"use strict";

const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

module.exports = {
  async setAsAbandoned(ctx) {
    // 每20分钟运行一次，把没没支付的订单改为 abandonStage === 0 , 进入召回流程
    let now = new Date();
    let duration = now.getTime() - 20 * 60 * 60 * 1000; // 只看20分钟内的订单


    let r = await strapi.query("order").find({
      // created_at_gt: duration, // 后面再说
      active: true,
      abandon_null: true,  // 把没变为abonon 的加一个空数组
      email_null: false,  // 只处理填了email的
    });



    if (r.length === 0) return ctx.send('nothing to do')

    r.map(x => {
      try {
        let stage = []

        strapi.query("order").update({ id: x.id }, { abandon: stage });
      } catch (error) {
        console.dir(error);
      }
    })
    return ctx.send('ok')
  },

  async abandonedEmail(ctx) {
    // 每20分钟运行一次，开始发送邮件

    let orderList = await strapi.services.abandon_order.findAbandonOrder();


    console.dir('可以发送的订单')
    console.log(JSON.stringify(orderList.map(x => x.id)))
    console.log(JSON.stringify(orderList.map(x => x.abandon)))



    if (orderList.length === 0) return ctx.send('no order need to send emails') // 没有就不用发了

    let messages = strapi.services.email.genEmailMessage(orderList); // 生产邮件消息

    console.dir('生产邮件成功')
    console.log(JSON.stringify(messages.map(x => x.to)))

    console.dir('发送的邮件模版')
    console.log(JSON.stringify(orderList.map(x => x.abandon[x.abandon.length - 1])))

    // if (process.env.NODE_ENV === 'development') {
    //   await strapi.services.abandon_order.updateOrderAbandonStage(orderList);
    //   return ctx.send(messages)
    // }


    try {

      let r = await sgMail.send(messages)
      await strapi.services.abandon_order.updateOrderAbandonStage(orderList);
      return ctx.send(r)

    } catch (error) {

      console.dir('error')
      console.log(error)

    }


  },
};
