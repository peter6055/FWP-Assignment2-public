// reference: https://raz-levy.medium.com/upload-images-to-aws-s3-using-react-js-and-node-js-express-server-bc15b959372c
import {Buffer} from 'buffer';

const AWS = require('aws-sdk');
const BUCKET_NAME = "s3789585";

// for sandbox environment only, using .env or system env value instead of hard coded on production environment
var config = new AWS.Config({
    accessKeyId: '',
    secretAccessKey: '',
    region: 'ap-southeast-2'
});

AWS.config.update(config);

const s3 = new AWS.S3({});

/**
 * @description Uploads an image to S3
 * @param imageName Image name
 * @param base64Image Image body converted to base 64
 * @param type Image type
 * @return string S3 image URL or error accordingly
 */
async function upload(imageName, base64Image, type){
    const params = {
        Bucket: `${BUCKET_NAME}/fwp-a1`,
        Key: imageName,
        Body: new Buffer.from(base64Image.replace(/^data:image\/\w+;base64,/, ""), 'base64'),
        ContentType: type
    };

    let data;

    try {
        data = await promiseUpload(params);
    } catch (err) {
        console.error(err);

        return "";
    }

    return data.Location;
}
/**
 * @description Promise an upload to S3
 * @param params S3 bucket params
 * @return data/err S3 response object
 */
function promiseUpload(params) {
    return new Promise(function (resolve, reject) {
        s3.upload(params, function (err, data) {
            if (err) {
                reject(err);
            } else {
                resolve(data);
            }
        });
    });
}

export {
    upload
}