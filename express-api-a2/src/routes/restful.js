const generateRestfulResponse = (code, data, message) => {
    var success;
    var response;

    if (code === 200) {
        success = true;
    } else {
        success = false;
    }

    switch (code) {
        case 200:
            success = true;
            response = "OK";
            break;

        case 400:
            success = false;
            response = "Bad Request";
            break;

        case 401:
            success = false;
            response = "Forbidden";
            break;

        case 403:
            success = false;
            response = "Bad Request";
            break;

        case 404:
            success = false;
            response = "Not Found";
            break;

        case 405:
            success = false;
            response = "Method Not Allowed";
            break;

        case 406:
            success = false;
            response = "Not Acceptable";
            break;

        default:
            success = false;
            response = "Unknown Error";
            break;
    }

    var restful =
        {
            "code": code,
            "response": response,
            "data": data,
            "message": message,
            "timestamp": Math.floor(Date.now() / 1000),
            "success": success
        };

    return restful;
}

module.exports = generateRestfulResponse;
