var dayjs = require("dayjs");

const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

let durations = {
  '1': {}
}


function whichStage(createdAt, now){
  // find which stage current in
  let duration = dayjs(now).diff(dayjs(createdAt), 'hour');



  console.log('%c 间隔','color:green;font-weight:bold')
  console.log(JSON.stringify(duration))

  if (duration < 1) {
    return 'firstEmail';
  }else if(duration >= 1 && duration < 24){
    return 'secondEmail';
  }else if (duration >= 24 && duration < 48) {
    return 'thirdEmail';
  }else if (duration >= 48 && duration < 72) {
    return 'fourthEmail';
  }




  return duration
}

module.exports = {

  async order(ctx) {
    let now = new Date()
    let daysAgo = now.getTime() - 24 * 60 * 60 * 1000 * 7; // 7 days ago we dont care about

    let r = await strapi.query("order").find({
      created_at_gt: daysAgo,
      active: true,
      // _limit: 1000,
      _sort: "id:desc",
      abandonStage: 0 // 只关心进入召回状态的订单
    });


    if (r.length === 0) {
      console.dir('无需发送')

      return 'ok'
    }




    // r.map(x => {
    //   let stage = whichStage(x.created_at, now)
    //   x.stage = stage
    //   return x
    // })



    let messages = [
      {
        to: 'example1@mail.com', // replace this with your email address
        from: 'Sadie Miller <sadie@thebigdonut.party>',
        subject: 'We miss you 😭',
        text: 'Get 10% off with coupon code NOMNOMNOM',
        html: '<p>Get 10% off with coupon code <b>NOMNOMNOM</b></p>',
      },
      {
        to: 'example2@mail.com', // replace this with your email address
        from: 'Lars Barriga <lars@thebigdonut.party>',
        subject: 'NEW! Ube rolls 😻',
        text: 'In addition to donuts, we are now selling ube rolls.',
        html: '<p>In addition to donuts, we are now selling ube rolls.</p>',
      },
    ];

    messages = r.map(x => {

      return {
        to: x.email, // replace this with your email address
        from: `${x.domain} <${'info@wudizu.com'}>`,
        subject: 'NEW! Ube rolls 😻',
        text: 'In addition to donuts, we are now selling ube rolls.',
        html: '<p>In addition to donuts, we are now selling ube rolls.</p>',
      }
    })

    console.dir('messages')
    console.log(JSON.stringify(messages))



    try {

      return await sgMail.send(messages)

    } catch (error) {

      console.dir('error')
      console.log(error)

    }







  },
};
