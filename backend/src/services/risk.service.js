const ML_SERVICE_URL = "http://127.0.0.1:5001";

async function getRisk(candles) {
    const response = await fetch(
        `${ML_SERVICE_URL}/risk`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                candles,
            }),
        }
    );

    if (!response.ok) {
        const error = await response.text();

        throw new Error(
            `ML risk service error: ${response.status} ${error}`
        );
    }

    return await response.json();
}

module.exports = {
    getRisk,
};