const lib = require('./lib/account');

exports.handler = async (event, context) => {
  console.log(`event: ${JSON.stringify(event, null, 2)}`);

  return await lib.handler(event, context);
};
