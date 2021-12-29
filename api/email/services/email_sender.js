const nodemailer = require("nodemailer");

const SMTP = {
  host: "smtpdm.aliyun.com",
  port: 465,
  username: "	info@mail.thousandcountry.com",
  password: "933OHCkV6t3xk",
};

async function mailGun(from, to, subject, html, text) {
  var mailTransport = nodemailer.createTransport({
    host: SMTP.host,
    port: SMTP.port,
    secureConnection: true, // 使用SSL方式（安全方式，防止被窃取信息）
    auth: {
      user: SMTP.username,
      pass: SMTP.password,
    },
  });

  //设置收件人信息
  let mailOptions = {
    from: SMTP.username, //谁发的
    replyTo: from, //回复给谁
    to, //发给谁
    subject, //主题是什么
    text, //文本内容
    html, //html模板

    //附件信息
    // attachments: [
    //   {
    //     filename: "",
    //     path: "",
    //   },
    // ],
  };

  try {
    let r = await mailTransport.sendMail(mailOptions);
    console.log("%c 邮件发送结果", "color:green;font-weight:bold");
    console.log(JSON.stringify(r));
  } catch (error) {
    console.log("%c 邮件发送失败", "color:red;font-weight:bold");
    console.dir("error", error);
    console.log(JSON.stringify(error));
  }
}

module.exports = { mailGun };
