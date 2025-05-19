import PhotoManipulator from 'react-native-photo-manipulator';
import ImageSize from 'react-native-image-size';
import { Dimensions } from 'react-native';

const PREVIEW_SIZE = Dimensions.get('window').width - 60;

export const cropCenterArea = async (
  photoPath,
  isPrescriptionMode,
  cameraLayout
) => {
  try {
    console.log('크롭 시작:', {
      photoPath,
      isPrescriptionMode,
      cameraLayout
    });
    
    const properPath = photoPath.startsWith('file://') ? photoPath : `file://${photoPath}`;

    // 1. 이미지 원본 크기 가져오기
    const { width: imageWidth, height: imageHeight } = await ImageSize.getSize(properPath);
    
    console.log('이미지 원본 크기:', imageWidth, imageHeight);
    console.log('카메라 뷰 크기:', cameraLayout);

    // 2. 원하는 크롭 영역의 비율 결정
    const previewWidth = PREVIEW_SIZE;
    const previewHeight = isPrescriptionMode
      ? (PREVIEW_SIZE * 4) / 3  // 처방전 모드는 4:3 비율
      : PREVIEW_SIZE;           // 알약 모드는 1:1 비율
    
    // 3. 종횡비 계산
    const cameraAspectRatio = cameraLayout.width / cameraLayout.height;
    const imageAspectRatio = imageWidth / imageHeight;
    const targetAspectRatio = previewWidth / previewHeight;
    
    console.log('카메라 종횡비:', cameraAspectRatio);
    console.log('이미지 종횡비:', imageAspectRatio);
    console.log('타겟 종횡비:', targetAspectRatio);
    
    // 4. 정확한 중앙 크롭 영역 계산
    let cropX, cropY, cropWidth, cropHeight;
    
    // 이미지를 먼저 카메라 뷰 비율로 생각하고 그 안에서 프리뷰 영역을 계산
    if (imageAspectRatio > cameraAspectRatio) {
      // 이미지가 더 가로로 긴 경우 (높이 기준으로 맞춤)
      const scale = imageHeight / cameraLayout.height;
      
      // 스케일링된 프리뷰 크기
      cropHeight = previewHeight * scale;
      cropWidth = previewWidth * scale;
      
      // 중앙 위치 계산
      cropY = (imageHeight - cropHeight) / 2;
      
      // 이미지가 더 넓으므로 X 위치 보정이 필요
      const scaledCameraWidth = cameraLayout.width * scale;
      const extraWidth = imageWidth - scaledCameraWidth;
      
      // 보더 위치를 고려한 X 좌표 계산
      const borderXRatio = (cameraLayout.width - previewWidth) / (2 * cameraLayout.width);
      cropX = (extraWidth / 2) + (scaledCameraWidth * borderXRatio);
    } else {
      // 이미지가 더 세로로 긴 경우 (너비 기준으로 맞춤)
      const scale = imageWidth / cameraLayout.width;
      
      // 스케일링된 프리뷰 크기
      cropWidth = previewWidth * scale;
      cropHeight = previewHeight * scale;
      
      // 중앙 위치 계산
      cropX = (imageWidth - cropWidth) / 2;
      
      // 이미지가 더 길므로 Y 위치 보정이 필요
      const scaledCameraHeight = cameraLayout.height * scale;
      const extraHeight = imageHeight - scaledCameraHeight;
      
      // 보더 위치를 고려한 Y 좌표 계산
      const borderYRatio = (cameraLayout.height - previewHeight) / (2 * cameraLayout.height);
      cropY = (extraHeight / 2) + (scaledCameraHeight * borderYRatio);
    }
    
    // 정수로 변환
    cropX = Math.floor(cropX);
    cropY = Math.floor(cropY);
    cropWidth = Math.floor(cropWidth);
    cropHeight = Math.floor(cropHeight);
    
    // 이미지 경계 확인 및 조정
    cropX = Math.max(0, Math.min(cropX, imageWidth - 10));
    cropY = Math.max(0, Math.min(cropY, imageHeight - 10));
    cropWidth = Math.min(cropWidth, imageWidth - cropX);
    cropHeight = Math.min(cropHeight, imageHeight - cropY);
    
    // 크롭 영역이 너무 작은 경우 처리
    if (cropWidth < 100 || cropHeight < 100) {
      console.warn('계산된 크롭 영역이 너무 작습니다. 기본값으로 대체합니다.');
      
      // 기본 중앙 크롭으로 대체
      const targetRatio = previewWidth / previewHeight;
      
      if (imageWidth / imageHeight > targetRatio) {
        // 이미지가 더 가로로 긴 경우
        cropHeight = Math.min(imageHeight, Math.floor(imageHeight * 0.9));
        cropWidth = Math.floor(cropHeight * targetRatio);
        
        // 중앙 정렬
        cropX = Math.floor((imageWidth - cropWidth) / 2);
        cropY = Math.floor((imageHeight - cropHeight) / 2);
      } else {
        // 이미지가 더 세로로 긴 경우
        cropWidth = Math.min(imageWidth, Math.floor(imageWidth * 0.9));
        cropHeight = Math.floor(cropWidth / targetRatio);
        
        // 중앙 정렬
        cropX = Math.floor((imageWidth - cropWidth) / 2);
        cropY = Math.floor((imageHeight - cropHeight) / 2);
      }
    }
    
    console.log('최종 크롭 영역:', {
      x: cropX,
      y: cropY,
      width: cropWidth,
      height: cropHeight
    });

    // 5. 크롭 실행
    const croppedUri = await PhotoManipulator.crop(
      properPath,
      {
        x: cropX,
        y: cropY,
        width: cropWidth,
        height: cropHeight,
      }
    );
    
    // 6. 이미지 품질 최적화 (선택적)
    try {
      // 크롭된 이미지 최적화를 시도합니다 (더 선명한 텍스트를 위해)
      const optimizedUri = await PhotoManipulator.optimize(croppedUri, 90);
      console.log('이미지 최적화 완료:', optimizedUri);
      return optimizedUri;
    } catch (optimizeError) {
      // 최적화에 실패하면 크롭된 원본을 반환
      console.log('이미지 최적화 실패, 크롭된 원본 반환:', optimizeError.message);
      return croppedUri;
    }
  } catch (err) {
    console.error('❌ 이미지 크롭 실패:', err.message, err.stack);
    return null;
  }
};