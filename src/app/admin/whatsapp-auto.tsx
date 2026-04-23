const accountSid ="AC7202c00895e01a5df4f7af47b74802c7";
const authToken = "6c4b064c86f503f852aaf7b2147a0ba7";
const client = require('twilio')(accountSid, authToken);

client.messages
      .create({
        from: 'whatsapp:+14155238886',
        body: "Your class is coming up soon!",
        to: 'whatsapp:+923150680899'
    })
    .then(message => console.log(message.sid))