const { CognitoUserPool, CognitoUserAttribute, CognitoUser, AuthenticationDetails } = require('amazon-cognito-identity-js');

const poolData = {
    UserPoolId: "us-east-1_bNjGkTk0i",
    ClientId: "5j71rgavtoflgog35ja3g6puj9"
};

const userPool = new CognitoUserPool(poolData);

const signIn = (req, res) => {
    const { username, password } = req.body;
    if (!(username && password)) {
        return res.status(401).json({ message: 'Invalid Credentials' });
    }


    //Create Cognito User
    const cognitoUser = new CognitoUser({
        Username: username,
        Pool: new CognitoUserPool({
            ClientId: poolData.ClientId,
            UserPoolId: poolData.UserPoolId
        }),
    });

    //Create Authentication Details object using username and password provided during signin API call
    const authenticationDetails = new AuthenticationDetails({
        Username: username,
        Password: password
    });

    userRes = {}
    err = '';

    cognitoUser.authenticateUser(authenticationDetails, {
        onSuccess: (result) => {
            userRes['accessToken'] = result.getAccessToken().getJwtToken();
            userRes['refreshToken'] = result.getRefreshToken().getToken();
            // userRes['idToken'] = result.getIdToken();
            const signInRes = { message: 'Login Successfully', ...userRes }
            return res.status(200).json(signInRes);

        }, onFailure: (err) => {
            userRes = {};
            console.log("err", err);
            err = err.message || err;
            const signInRes = { message: 'Login Failed' + err }
            return res.status(401).json(signInRes);
        }
    })

    // if (userRes.accessToken & !error) {
    //     const signInRes = { message: 'Login Successfully', ...userRes }
    //     return res.status(200).json(signInRes);
    // } else {
    //     const signInRes = { message: 'Login Failed' + err }
    //     return res.status(401).json(signInRes);
    // }


}

const signUp = (req, res) => {
    const { email, password, username } = req.body;

    if (!(email && password && username)) {
        return res.status(401).json({ message: "Please Provide Proper Request Parameter" })
    }

    let emailAttrData = {
        Name: 'email',
        Value: email,
    };
    emailAttr = new CognitoUserAttribute(emailAttrData)
    userPool.signUp(username, password, [emailAttr], null, (err, result) => {
        console.log("Called");
        if (err) {
            //     return res.status(500).json({ message: err.message || JSON.stringify(err) })
            // const awsError = err;
            let message = '';
            switch (err.name) {
                case 'UsernameExistsException':
                    message = 'User already exists.';
                    break;
                case 'InvalidParameterException':
                    message = 'Invalid parameters provided';
                    break;
                case 'TooManyRequestsException':
                    message = 'Too many requests, please try again later';
                    break;
                default:
                    message = 'An unexpected error occurred';
            }
            return res.status(500).json({ message: message, details: err });
        }
        console.log("Success", result);
        var cognitoUser = result.user;
        const signInRes = { message: cognitoUser.getUsername() }
        return res.status(201).json(signInRes);
    });

}

const verifyCode = (req, res) => {
    const { username, code } = req.body;

    if (!(username && code)) {
        return res.status(400).json({ message: "Bad Request" })
    }

    const cognitoUser = new CognitoUser({
        Username: username,
        Pool: new CognitoUserPool({
            ClientId: poolData.ClientId,
            UserPoolId: poolData.UserPoolId
        })

    });



    cognitoUser.confirmRegistration(code, true, (err, result) => {
        if (err) {
            let message = '';
            switch (err.name) {
                case 'InvalidParameterException':
                    message = 'Invalid parameters provided';
                    break;
                default:
                    message = 'An unexpected error occurred';
            }
            return res.status(500).json({ message: message, details: err });
        }
        return res.status(200).json({ "success": true });
    })


}



module.exports = {
    signIn,
    signUp,
    verifyCode
};