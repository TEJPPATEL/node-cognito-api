const axios = require('axios');
const jwkToPem = require('jwk-to-pem');
const jwt = require('jsonwebtoken');


const validateToken = async (req, res, next) => {
    const { authorization } = req.headers;
    //Check Request Header includes Authorization property
    if (!(authorization && authorization.includes('Bearer'))) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    //Decode Token
    const token = authorization.split(' ')[1];
    const decodedJwt = jwt.decode(token, { complete: true });
    if (!(token && decodedJwt)) {
        return res.status(401).json({ message: "Invalid Token" });
    }

    let pem = {};
    const jwkKeys = await getJWKKeys(req, res, next);
    // console.log("Jwt keys", jwkKeys)
    // const findKeyId = jwkKeys.find((key) => key.kid === decodedJwt.header.kid);
    // if (findKeyId) {

    // }

    // console.log(jwkKeys.find((key) => key.kid === decodedJwt.header.kid));

    for (var i = 0; i < jwkKeys?.length; i++) {
        //Convert each key to PEM
        let key_id = jwkKeys[i].kid;
        let modulus = jwkKeys[i].n;
        let exponent = jwkKeys[i].e;
        let key_type = jwkKeys[i].kty;
        let jwk = { kty: key_type, n: modulus, e: exponent };
        pem[key_id] = jwkToPem(jwk);
    }
    pem = pem[decodedJwt.header.kid];

    if (!(pem && Object.keys(pem).length)) {
        return res.status(401).json({ message: "Invalid Token" })
    }

    jwt.verify(token, pem, (err, payload) => {
        if (err) {
            return res.status(401).json({ message: "Invalid Token" });
        } else {
            return next();
        }
    });

}


const getJWKKeys = async (req, res, next) => {
    try {
        const region = 'us';
        const userPoolId = 'us-east-1_bNjGkTk0i'
        const URL = `https://cognito-idp.${region}.amazonaws.com/${userPoolId}/.well-known/jwks.json`;
        const jwks = await axios.get(URL);
        return jwks.data.keys;
    }
    catch (err) {
        return res.status(500).json({ message: "Internal Server Error" })
    }
}


module.exports = { validateToken };
