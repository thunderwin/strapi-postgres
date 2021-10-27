const websites = {
  "www.chocolateladie.com": {
    paypalConfig: {
      paypalAccount: "beeavern@163.com",
      paypalId:
        "ASXrp1yKHKzPNxHXE8_oHL8PoP_pqtCE9GsOrbIajds_tRvJg6QOqpOYYUZgNujdK65UJR5jvUvnbbHq",
      paypalKey:
        "ECj_FNMNZbYcBtbxX43KSkwg2KUIFekT9wXICvLBx7EZV44ECAMrpQPRxs15A8ZAI6JElsnc5NFmLIVV",
    },
  },
  "wudizu.myshopify.com": {
    paypalConfig: {
      paypalAccount: "free.lei.sheng-facilitator@gmail.com",
      paypalId:
        "ASnwz_T0VEvmifWp9MkaKro84lGBjdhNcUAw7lrWeVcNAeg2PzdqY32QxN9wFoxVLwTYmGNKgEJbpilk",
      paypalKey:
        "EFZrIisWYYC8jUYZSPWjJ6H5OItKYPuEDdUyn_avva8Hh4eLG34Kre2MxL7ZgPOtxvEqOOcrN863q_hi",
    },
  },
  "ivchicy.myshopify.com": {
    paypalConfig: {
      paypalAccount: "free.lei.sheng-facilitator@gmail.com",
      paypalId:
        "ASnwz_T0VEvmifWp9MkaKro84lGBjdhNcUAw7lrWeVcNAeg2PzdqY32QxN9wFoxVLwTYmGNKgEJbpilk",
      paypalKey:
        "EFZrIisWYYC8jUYZSPWjJ6H5OItKYPuEDdUyn_avva8Hh4eLG34Kre2MxL7ZgPOtxvEqOOcrN863q_hi",
    },
  },
  "www.ivchicy.com": {
    paypalConfig: {
      paypalAccount: "free.lei.sheng-facilitator@gmail.com",
      paypalId:
        "ASnwz_T0VEvmifWp9MkaKro84lGBjdhNcUAw7lrWeVcNAeg2PzdqY32QxN9wFoxVLwTYmGNKgEJbpilk",
      paypalKey:
        "EFZrIisWYYC8jUYZSPWjJ6H5OItKYPuEDdUyn_avva8Hh4eLG34Kre2MxL7ZgPOtxvEqOOcrN863q_hi",
    },
  },
};

module.exports = function (domain) {
  return (
    websites[domain] || {
      paypalConfig: {
        paypalAccount: "free.lei.sheng-facilitator@gmail.com",
        paypalId:
          "ASnwz_T0VEvmifWp9MkaKro84lGBjdhNcUAw7lrWeVcNAeg2PzdqY32QxN9wFoxVLwTYmGNKgEJbpilk",
        paypalKey:
          "EFZrIisWYYC8jUYZSPWjJ6H5OItKYPuEDdUyn_avva8Hh4eLG34Kre2MxL7ZgPOtxvEqOOcrN863q_hi",
      },
    }
  );
};
