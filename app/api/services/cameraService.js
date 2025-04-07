import PhotoManipulator from 'react-native-photo-manipulator';
import { Platform, Dimensions } from 'react-native';
import ImageSize from 'react-native-image-size';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const PREVIEW_SIZE = screenWidth - 60;

export const cropCenterArea = async (photoPath, isPrescriptionMode) => {
  try {
    const properPath = photoPath.startsWith('file://') ? photoPath : `file://${photoPath}`;

    // ✅ 1. 이미지 원본 크기 가져오기
    const { width: imageWidth, height: imageHeight } = await ImageSize.getSize(properPath);

    // ✅ 2. 보더라인 기준 영역 계산 (화면 기준)
    const previewWidth = PREVIEW_SIZE;
    const previewHeight = isPrescriptionMode ? (PREVIEW_SIZE * 4) / 3 : PREVIEW_SIZE;
    const previewX = (screenWidth - previewWidth) / 2;
    const previewY = (screenHeight - previewHeight) / 2;

    // ✅ 3. 비율 기반으로 이미지 상의 좌표 환산
    const xRatio = imageWidth / screenWidth;
    const yRatio = imageHeight / screenHeight;

    const cropRegion = {
      x: Math.floor(previewX * xRatio),
      y: Math.floor(previewY * yRatio),
      width: Math.floor(previewWidth * xRatio),
      height: Math.floor(previewHeight * yRatio),
    };

    console.log('원본 이미지 크기:', imageWidth, imageHeight);
    console.log('크롭 영역:', cropRegion);

    const croppedUri = await PhotoManipulator.crop(properPath, cropRegion);
    return croppedUri;
  } catch (err) {
    console.error('이미지 크롭 실패:', err.message);
    return null;
  }
};
