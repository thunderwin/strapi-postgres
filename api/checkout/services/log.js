module.exports = {
  logError:  function(reason, error) {

    strapi.query('log-checkout').create({reason, error})

  }
}
