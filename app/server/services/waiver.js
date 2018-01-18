var User = require('../models/User');
var hellosign = require('hellosign-sdk')({key: process.env.HELLOSIGN_KEY});

function updateWaiverStatus() {
  console.log('Updating waiver status...');

  hellosign.signatureRequest.list({
    query: 'complete:true'
  })
  .then(function(response){
    if (response.signature_requests.length) {
      response.signature_requests.forEach((signature) => {
        var email = signature.signatures[0].signer_email_address;

        User.findOne({
          'email': email.toLowerCase(),
          'status.admitted': true
        }).exec(function(err, user) {
          if (err || !user){
            return;
          }

          if (!user.confirmation.signatureLiability || user.confirmation.signatureLiability === '') {
            User.findOneAndUpdate({
              'email': email,
              'status.admitted': true
            },{
              $set: {
                'confirmation.signatureLiability': Date.now()
              }
            }, {
              new: true
            }, (success, error) => {
              console.error(error)
            });
          }
        })
      })

      console.log('Waiver status updated!');
    }
  })
  .catch(function(err){
    console.error(err);
    return;
  });
}

// Fetch new signature list once every 30 seconds.
updateWaiverStatus();
setInterval(updateWaiverStatus, 30000);

var Waiver = {}

module.exports = Waiver;
