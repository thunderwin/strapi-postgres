// 确认对方是授权过的服务器
module.exports = async (ctx, next) => {
  console.dir("ctx");
  console.log(JSON.stringify(ctx));

  if (ctx.header && ctx.header.token) {
    if (ctx.header.token === process.env.VERIFIED_SERVER_TOKEN) {
      return await next();
      // Go to next policy or will reach the controller's action.
    }else{
      ctx.unauthorized(`your token is incorrect!`);
    }
  } else {
    ctx.unauthorized(`You're not allowed to perform this action!`);
  }
};
