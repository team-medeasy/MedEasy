// MedicineDetailShimmer.js
import React from 'react';
import { View, Dimensions } from 'react-native';
import ShimmerPlaceholder from 'react-native-shimmer-placeholder';
import LinearGradient from 'react-native-linear-gradient';
import { themes } from '../../styles';

const screenWidth = Dimensions.get('window').width;
const contentPadding = 20;

// 향상된 설정으로 쉬머 컴포넌트 생성
const Shimmer = props => (
  <ShimmerPlaceholder
    shimmerColors={[
      themes.light.boxColor.placeholder || '#E0E0E0',
      '#F5F5F5',
      themes.light.boxColor.placeholder || '#E0E0E0',
    ]}
    shimmerStyle={{ borderRadius: props.borderRadius || 4 }}
    LinearGradient={LinearGradient}
    visible={false}
    duration={1500}
    {...props}
  />
);

const MedicineDetailShimmer = () => {
  return (
    <View style={{ flex: 1, backgroundColor: themes.light.bgColor.bgPrimary }}>
      {/* 약 이미지 영역 (블러 배경) */}
      <View style={{ 
        backgroundColor: '#f0f0f0', 
        padding: contentPadding,
        paddingTop: 38,
        paddingBottom: 25,
      }}>
        {/* 이미지 컨테이너 */}
        <Shimmer 
          width={screenWidth - contentPadding * 2} 
          height={188} 
          style={{ marginBottom: 19 }}
          borderRadius={10}
        />
        
        {/* 제약사명 */}
        <Shimmer 
          width={screenWidth * 0.5} 
          height={18} 
          style={{ marginBottom: 10 }}
        />
        
        {/* 약품명 */}
        <Shimmer 
          width={screenWidth * 0.7} 
          height={24} 
          style={{ marginBottom: 10 }}
        />
        
        {/* 제형 */}
        <Shimmer 
          width={screenWidth * 0.4} 
          height={18} 
          style={{ marginBottom: 10 }}
        />
        
        {/* 태그 영역 */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <Shimmer width={105} height={28} borderRadius={6} />
            <Shimmer width={150} height={28} borderRadius={6} />
          </View>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <Shimmer width={24} height={24} borderRadius={12} />
            <Shimmer width={24} height={24} borderRadius={12} />
          </View>
        </View>
      </View>
      
      {/* 약품 외형 정보 */}
      <View style={{ padding: contentPadding }}>
        <Shimmer 
          width={screenWidth - contentPadding * 2} 
          height={100} 
          style={{ marginVertical: 20 }}
          borderRadius={10}
        />
        
        {/* 금기사항 타이틀 */}
        <Shimmer 
          width={120} 
          height={22} 
          style={{ marginBottom: 12 }}
        />
        
        {/* 병용금기 */}
        <View style={{ flexDirection: 'row', marginBottom: 15, alignItems: 'flex-start' }}>
          <Shimmer 
            width={28} 
            height={28} 
            style={{ marginRight: 12 }}
            borderRadius={6}
          />
          <View style={{ flex: 1 }}>
            <Shimmer 
              width={100} 
              height={20} 
              style={{ marginBottom: 8 }}
            />
            <Shimmer 
              width='100%' 
              height={16} 
              style={{ marginBottom: 4 }}
            />
            <Shimmer 
              width='90%' 
              height={16} 
            />
          </View>
        </View>
        
        {/* 노인주의 */}
        <View style={{ flexDirection: 'row', marginBottom: 15, alignItems: 'flex-start' }}>
          <Shimmer 
            width={28} 
            height={28} 
            style={{ marginRight: 12 }}
            borderRadius={6}
          />
          <View style={{ flex: 1 }}>
            <Shimmer 
              width={100} 
              height={20} 
              style={{ marginBottom: 8 }}
            />
            <Shimmer 
              width='100%' 
              height={16} 
              style={{ marginBottom: 4 }}
            />
            <Shimmer 
              width='60%' 
              height={16} 
            />
          </View>
        </View>
        
        {/* 임부금기 */}
        <View style={{ flexDirection: 'row', marginBottom: 15, alignItems: 'flex-start' }}>
          <Shimmer 
            width={28} 
            height={28} 
            style={{ marginRight: 12 }}
            borderRadius={6}
          />
          <View style={{ flex: 1 }}>
            <Shimmer 
              width={100} 
              height={20} 
              style={{ marginBottom: 8 }}
            />
            <Shimmer 
              width='100%' 
              height={16} 
              style={{ marginBottom: 4 }}
            />
            <Shimmer 
              width='80%' 
              height={16} 
            />
          </View>
        </View>
      </View>
      
      {/* 분리선 */}
      <Shimmer 
        width='100%' 
        height={15} 
        style={{ borderRadius: 0 }}
      />
      
      {/* 효능, 복용법, 보관법 등 */}
      <View style={{ padding: contentPadding, marginTop: 20 }}>
        {/* 효능 타이틀 */}
        <Shimmer 
          width={200} 
          height={22} 
          style={{ marginBottom: 18 }}
        />
        {/* 효능 내용 */}
        <Shimmer 
          width='100%' 
          height={18} 
          style={{ marginBottom: 5 }}
        />
        <Shimmer 
          width='90%' 
          height={18} 
          style={{ marginBottom: 25 }}
        />
        
        {/* 복용법 타이틀 */}
        <Shimmer 
          width={180} 
          height={22} 
          style={{ marginBottom: 18 }}
        />
        {/* 복용법 내용 */}
        <Shimmer 
          width='100%' 
          height={18} 
          style={{ marginBottom: 5 }}
        />
        <Shimmer 
          width='85%' 
          height={18} 
          style={{ marginBottom: 25 }}
        />
        
        {/* 보관법 타이틀 */}
        <Shimmer 
          width={170} 
          height={22} 
          style={{ marginBottom: 18 }}
        />
        {/* 보관법 내용 */}
        <Shimmer 
          width='100%' 
          height={18} 
          style={{ marginBottom: 5 }}
        />
        <Shimmer 
          width='70%' 
          height={18} 
          style={{ marginBottom: 30 }}
        />
        
        {/* 비슷한 약 섹션 헤더 */}
        <Shimmer 
          width={150} 
          height={22} 
          style={{ marginBottom: 18 }}
        />
        
        {/* 비슷한 약 아이템들 */}
        <View style={{ flexDirection: 'row', gap: 15 }}>
          {[1, 2, 3].map(i => (
            <Shimmer 
              key={i}
              width={120} 
              height={150} 
              borderRadius={8}
            />
          ))}
        </View>
      </View>
      
      {/* 하단 버튼 */}
      <View style={{ 
        padding: contentPadding,
        marginTop: 20,
        alignItems: 'center',
      }}>
        <Shimmer 
          width={screenWidth - contentPadding * 2} 
          height={50} 
          borderRadius={10}
        />
      </View>
    </View>
  );
};

export default MedicineDetailShimmer;