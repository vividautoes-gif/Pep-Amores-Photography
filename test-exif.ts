import ExifReader from 'exifreader';
import fs from 'fs';

async function run() {
    // Just mock structure to see how exifreader works if possible, 
    // but without an image it's hard. Is there any sample image around?
    const files = fs.readdirSync('./public');
    for (const f of files) {
        if (f.endsWith('.jpg') || f.endsWith('.jpeg')) {
            console.log("Found image: ", f);
            const tags = await ExifReader.load('./public/' + f);
            console.log("GPSLat", tags['GPSLatitude']);
            console.log("GPSLon", tags['GPSLongitude']);
            console.log("GPSLatRef", tags['GPSLatitudeRef']);
        }
    }
}
run().catch(console.error);
