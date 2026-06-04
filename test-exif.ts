import * as fs from 'fs';
import ExifReader from 'exifreader';

async function test() {
  const buf = await fetch('https://raw.githubusercontent.com/ianare/exif-samples/master/jpg/gps/DSCN0010.jpg').then(r => r.arrayBuffer());
  fs.writeFileSync('sample.jpg', Buffer.from(buf));
  
  const tags = await ExifReader.load('sample.jpg');
  console.log("Latitude:", JSON.stringify(tags['GPSLatitude']));
  console.log("Longitude:", JSON.stringify(tags['GPSLongitude']));
  console.log("LatRef:", JSON.stringify(tags['GPSLatitudeRef']));
  console.log("LngRef:", JSON.stringify(tags['GPSLongitudeRef']));
}
test().catch(console.error);
