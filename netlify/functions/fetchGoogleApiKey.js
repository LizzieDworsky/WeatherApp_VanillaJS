exports.handler = async function (event, context) {
    const API_KEY = process.env.googleApiKey; // Access the API key from environment variables

    return {
        statusCode: 200,
        body: JSON.stringify({ key: API_KEY }),
    };
};
