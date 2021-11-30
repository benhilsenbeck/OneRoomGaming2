import axios from "axios"
const config = require('./constants').config()

async function CheckToken() {
    var token = localStorage.getItem("access_token");
    var refreshToken = localStorage.getItem("refresh_token");

    async function validateToken() {
        var response = await axios.post(config.API_URL + "token/check", {
            access: token
        })
        return response
    }

    async function resetToken() {
        var response1 = await axios.post(config.API_URL + 'token/refresh', {
            refresh: refreshToken
        })
        return response1
    }

    async function returnValidation() {
        if (token === null) {
            if (refreshToken === null) {
                return 'redirect'
            } else {
                var newToken = await resetToken()
                localStorage.setItem('access_token', newToken['data']['access'])
                return 'resetAccessToken'
            }
        } else {
            var tokenCheck2 = await validateToken()
            if (tokenCheck2['data'] !== 'Valid') {
                var newToken2 = await resetToken()
                localStorage.setItem('access_token', newToken2['data']['access'])
                return "resetAccessToken"
            } else {
                return "Valid"
            }
        }
    }
    return await returnValidation()
}

export default CheckToken