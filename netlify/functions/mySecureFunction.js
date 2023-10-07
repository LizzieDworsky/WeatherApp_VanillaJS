exports.handler = async function (event, context) {
    const API_KEY = process.env.apiKeyOne; // Access the API key from environment variables

    return {
        statusCode: 200,
        key: API_KEY,
    };
};
