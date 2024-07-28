const Minio = require('minio');
require('dotenv').config({ path: '.env' });
const minioClient = new Minio.Client({
    endPoint: process.env.MINIO_ENDPOINT,
    port: parseInt(process.env.MINIO_PORT, 10),
    useSSL: false,
    accessKey: process.env.MINIO_ACCESS_KEY,
    secretKey: process.env.MINIO_SECRET_KEY,
});
const buckets = ['rubrics', 'answerkeys', 'submissions', 'students'];

buckets.forEach(bucket => {
    minioClient.bucketExists(bucket, function (err) {
        if (err && err.code === 'NoSuchBucket') {
            minioClient.makeBucket(bucket, 'us-east-1', function (err) {
                if (err) {
                    return console.log(`Error creating bucket ${bucket}.`, err);
                }
                console.log(`Bucket ${bucket} created successfully.`);
            });
        } else if (err) {
            console.log(`Error checking bucket ${bucket}.`, err);
        } else {
            console.log(`Bucket ${bucket} already exists.`);
        }
    });
});

module.exports = minioClient;
