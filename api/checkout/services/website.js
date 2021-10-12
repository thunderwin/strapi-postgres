const websites = {
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
