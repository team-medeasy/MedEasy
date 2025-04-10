import PhotoManipulator from 'react-native-photo-manipulator';
import ImageSize from 'react-native-image-size';
import { Dimensions } from 'react-native';

const PREVIEW_SIZE =  Dimensions.get('window').width - 60;

export const cropCenterArea = async (
  photoPath,
  isPrescriptionMode,
  cameraLayout // ← onLayout에서 전달받은 값
) => {
  try {
    const properPath = photoPath.startsWith('file://') ? photoPath : `file://${photoPath}`;

    // 1. 이미지 원본 크기 가져오기
    const { width: imageWidth, height: imageHeight } = await ImageSize.getSize(properPath);
    const imageAspectRatio = imageWidth / imageHeight;

    // 2. 보더라인 크기 계산 (앱 UI 기준)
    const previewWidth = PREVIEW_SIZE;
    const previewHeight = isPrescriptionMode
      ? (PREVIEW_SIZE * 4) / 3
      : PREVIEW_SIZE;
    const previewAspectRatio = previewWidth / previewHeight;

    // 3. 보더라인 위치 계산 (카메라 화면 내 정중앙)
    const previewX = (cameraLayout.width - previewWidth) / 2;
    const previewY = (cameraLayout.height - previewHeight) / 2;

    // 4. 실제 이미지 크기에 맞게 비율 환산
    let cropX, cropY, cropWidth, cropHeight;

    if (imageAspectRatio > previewAspectRatio) {
      // 이미지 가로가 더 넓은 경우, 높이에 맞춰 크롭
      cropHeight = imageHeight;
      cropWidth = Math.floor(imageHeight * previewAspectRatio);
      cropX = Math.floor((imageWidth - cropWidth) / 2);
      cropY = 0;
    } else {
      // 이미지 세로가 더 넓거나 비율이 같은 경우, 너비에 맞춰 크롭
      cropWidth = imageWidth;
      cropHeight = Math.floor(imageWidth / previewAspectRatio);
      cropX = 0;
      cropY = Math.floor((imageHeight - cropHeight) / 2);
    }

    console.log('✅ 이미지 원본 크기:', imageWidth, imageHeight);
    console.log('✅ 카메라 렌더 크기:', cameraLayout);
    console.log('✅ 계산된 크롭 영역:', { x: cropX, y: cropY, width: cropWidth, height: cropHeight });

    // 5. 크롭 실행
    const croppedUri = await PhotoManipulator.crop(properPath, {
      x: cropX,
      y: cropY,
      width: cropWidth,
      height: cropHeight,
    });
    return croppedUri;
  } catch (err) {
    console.error('❌ 이미지 크롭 실패:', err.message);
    return null;
  }
};