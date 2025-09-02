// const { SerialPort } = require('serialport');
// const port = new SerialPort({
//     path: "COM5", // Update this to your correct COM port
//     baudRate: 9600,
//     dataBits: 8,
//     parity: 'none',
//     stopBits: 1,
//     autoOpen: false,  // Prevent auto open, we'll open it manually
// });
 
// // Function to open the port
// const openPort = () => {
//     return new Promise((resolve, reject) => {
//         if (port.isOpen) {
//             console.log('Port is already open');
//             resolve();
//         } else {
//             port.open((err) => {
//                 if (err) {
//                     console.error('Error opening port:', err.message);
//                     reject(err);
//                 } else {
//                     console.log('Port opened successfully');
//                     resolve();
//                 }
//             });
//         }
//     });
// };
 
// // Function to read weight
// const getWeight = () => {
//     return new Promise(async (resolve, reject) => {
//         try {
//             await openPort(); // Ensure port is open before reading
//             const requestCommand = Buffer.from('SI\r\n'); // Change if your device needs a different command
 
//             port.write(requestCommand, (err) => {
//                 if (err) {
//                     console.error('Error writing to port:', err.message);
//                     reject(err);
//                 } else {
//                     console.log('Polling command sent');
//                 }
//             });
 
//             port.once('data', (data) => {
//                 let weight = data.toString().trim();
//                 weight=weight.replace(/[^\d.]/g,'')
//                 console.log('Received weight:', weight);
//                 resolve(weight);
//             });
 
//         } catch (err) {
//             reject(err);
//         }
 
//         port.on('error', (err) => {
//             console.error('Serial port error:', err);
//             reject(err);
//         });
//     });
// };
 
// module.exports = { getWeight };


 
const { SerialPort } = require('serialport');
require("dotenv").config();


const port = new SerialPort({
    path:process.env.COMPORT, // Update with the correct COM port
    baudRate: 9600,
    dataBits: 8, 
    parity: 'none',
    stopBits: 1,
    autoOpen: false,
});


const openPort = () => {
    return new Promise((resolve, reject) => {
        if (port.isOpen) {
            console.log('Port is already open');
       
            resolve();
        } else {
            port.open((err) => {
                if (err) {
                    console.error('Error opening port:', err.message);
                    reject(err);
                } else {
                    console.log('Port opened successfully');
                    resolve();
                }
            });
        }
    });
};

const getWeight = () => {
    console.log(process.env.COMPORT)
    return new Promise(async (resolve, reject) => {
        try {
            await openPort(); // Ensure port is open before reading

            // Clear the buffer before writing
            port.flush((err) => {
                if (err) console.error('Error flushing port:', err.message);
            });

            const requestCommand = Buffer.from('SI\r\n'); // Adjust this command if needed

            port.write(requestCommand, (err) => {
                if (err) {
                    console.error('Error writing to port:', err.message);
                    reject(err);
                } else {
                    console.log('Polling command sent');
                }
            });

            let receivedData = '';

            // Listen for incoming data
            const onDataReceived = (data) => {
                receivedData += data.toString(); // Append received data
                console.log('Raw data received:', receivedData);

                if (receivedData.includes('\r') || receivedData.includes('\n')) { // Check for end of response
                    let weight = receivedData.match(/[\d]+\.[\d]+/g); // Extract number with decimal
                    if (weight) {
                        console.log('Extracted weight:', weight[0]);
                        port.off('data', onDataReceived); // Stop listening after getting weight
                        resolve(weight[0]); // Return extracted weight
                    } else {
                        console.error('Weight not found in received data');
                        reject('Weight not found');
                    }
                }
            };

            port.on('data', onDataReceived);

        } catch (err) {
            reject(err);
        }

        port.on('error', (err) => {
            console.error('Serial port error:', err);
            reject(err);
        });
    });
};

module.exports = { getWeight };

 