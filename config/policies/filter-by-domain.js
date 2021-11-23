module.exports = async (ctx, next) => {
  // console.dir("ctx");
  // console.log(JSON.stringify(ctx.query));

  if (ctx.state.user && ctx.query) {
    // console.dir("ctx.state.user");
    // console.log(JSON.stringify(ctx.state.user));

    let domains = ctx.state.user.shopifies.map((x) => x.domain);
    let domain_in = ctx.query.domain_in;
    if (domain_in) {
      if (!domains.includes(domain_in)) {
        ctx.unauthorized(`you are not allowed to check this website!`);
      }
    } else {
      ctx.query.domain_in = domains;
    }
    return await next()
    // Go to next policy or will reach the controller's action.
  }else{
    ctx.unauthorized(`You're not allowed to perform this action!`);
  }


};
