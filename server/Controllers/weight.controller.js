const { getWeight } = require('../serialPort/serialPort');

exports.getWeightController = async (req, res) => {
    try {
        const data = await getWeight(); 

        if (!data) {
            return res.status(404).json({ message: "Weighing machine not connected or no data received." });
        }

        const formattedWeight = Number(data).toFixed(3); 
        console.log('Serial weight:', formattedWeight);

        return res.status(200).json({ weightdata: formattedWeight });

    } catch (err) {
        console.error('Error fetching weight:', err);

        // Customize error message based on common SerialPort errors
        let message = "Weighing machine not connected.";
        if (err.message.includes('cannot open')) {
            message = "COM port not available. Please check if the cable is connected.";
        }

        return res.status(500).json({ error: message, details: err.message });
    }
};
