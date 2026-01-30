const express = require('express');
const bodyParser = require('body-parser');
const OAuth = require('oauth-1.0a');
const crypto = require('crypto');
const qs = require('qs');

const app = express();
const PORT = process.env.PORT || 3000;

// PesaPal credentials
const CONSUMER_KEY = 'c3B0ez0KM/Q6iDabgyFWcDGPFHL1ZdPh';
const CONSUMER_SECRET = 'mMGTYLWhgSv6iU1xL7NVzrednlA=';

app.use(bodyParser.json());
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

app.post('/pay', (req, res) => {
  const { amount, email } = req.body;
  const reference = Date.now();

  const url = 'https://www.pesapal.com/API/PostPesapalDirectOrderV4';

  const oauth = OAuth({
    consumer: { key: CONSUMER_KEY, secret: CONSUMER_SECRET },
    signature_method: 'HMAC-SHA1',
    hash_function(base_string, key) {
      return crypto.createHmac('sha1', key).update(base_string).digest('base64');
    },
  });

  const params = {
    Amount: amount,
    Description: 'Payment for service',
    Type: 'MERCHANT',
    Reference: reference,
    Email: email,
    Currency: 'KES',
    Callback_URL: 'https://your-app.fly.dev/callback'
  };

  const request_data = { url: url + '?' + qs.stringify(params), method: 'GET' };
  const authHeader = oauth.toHeader(oauth.authorize(request_data));

  const checkoutUrl = request_data.url + '&' + qs.stringify({ oauth_signature: authHeader['Authorization'].split('"')[1] });

  res.json({ checkoutUrl });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
