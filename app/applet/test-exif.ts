import ExifReader from 'exifreader';
import fs from 'fs';

async function test() {
  // We need an image with EXIF data to test, but we don't have one easily available.
  // Let's just check the types if possible, or we can just assume the description might be a string.
  console.log("ExifReader loaded");
}
test();
