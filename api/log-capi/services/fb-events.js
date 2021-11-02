class VerifyParams{

  verify(params,keys){
    keys = keys.split(",");
    let inputKeys = Object.keys(params);

    for (let i = 0; i < inputKeys.length; i++) {
      if (!keys.includes(inputKeys[i])) {
        console.log("%c ??", "color:red;font-weight:bold");
        console.log(`${inputKeys[i]} is not a valid key`);
        throw new Error(`${inputKeys[i]} is not a valid key`);
      }
    }
  }
}


class InitiateCheckout extends VerifyParams {
  constructor(params) {
    super();
    this.params = params;

    console.log("%c ??", "color:green;font-weight:bold");
    console.log(JSON.stringify());

    if (!this.verify(params, InitiateCheckout.requiredParams)) {
      return false
    };
  }

  static requiredParams = 'content_category,content_ids,contents,currency,num_items,value'

}

