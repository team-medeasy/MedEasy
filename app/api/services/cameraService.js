import PhotoManipulator from 'react-native-photo-manipulator';
import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const cropCenterArea = async (photoPath, isPrescriptionMode) => {
  try {
    // Ensure PhotoManipulator is available
    if (!PhotoManipulator) {
      console.error('PhotoManipulator is not available');
      return null;
    }

    // Make sure the path is properly formatted
    const properPath = photoPath.startsWith('file://') ? photoPath : `file://${photoPath}`;
    
    // Define the crop region
    const cropWidth = width - 60;
    const cropHeight = isPrescriptionMode ? (cropWidth * 4) / 3 : cropWidth;
    
    const originX = (width - cropWidth) / 2;
    const originY = (height - cropHeight) / 2;
    
    const cropRegion = {
      x: Math.floor(originX),
      y: Math.floor(originY),
      width: Math.floor(cropWidth),
      height: Math.floor(cropHeight),
    };

    console.log('Cropping with region:', cropRegion);
    console.log('Using path:', properPath);

    // Perform the crop operation
    const croppedUri = await PhotoManipulator.crop(
      properPath,
      cropRegion
    );

    console.log('Crop successful, new URI:', croppedUri);
    return croppedUri;
  } catch (err) {
    console.error('이미지 크롭 실패:', err);
    return null;
  }
};