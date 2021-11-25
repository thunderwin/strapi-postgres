module.exports = async (ctx, next) => {
  // console.dir("ctx");
  // console.log(JSON.stringify(ctx.query));

  if (ctx.state.user && ctx.query) {
    // console.dir("ctx.state.user");
    // console.log(JSON.stringify(ctx.state.user));

    let domains = ctx.state.user.shopifies.map((x) => x.domain);

    // Go to next policy or will reach the controller's action.
  }else{
    ctx.unauthorized(`You're not allowed to perform this action!`);
  }


};
