// app/aQuery/aQueryController.js

exports.getAQuery = async (req, res) => {
    try {
        console.log('Received aQuery request');
        const result = { message: 'aQuery request successful' };
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}