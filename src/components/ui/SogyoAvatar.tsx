import React from 'react';
import { Image, View, ViewStyle, ImageStyle } from 'react-native';
import { IMAGES } from '../../../assets/images';

export interface SogyoAvatarProps {
  size?: number;
  style?: ViewStyle;
  imageStyle?: ImageStyle;
  showBorder?: boolean;
  borderColor?: string;
}

export function SogyoAvatar({ 
  size = 32, 
  style = {}, 
  imageStyle = {},
  showBorder = false,
  borderColor = '#7C3AED'
}: SogyoAvatarProps) {
  return (
    <View
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          overflow: 'hidden',
          backgroundColor: '#F8FAFC',
          ...(showBorder && {
            borderWidth: 2,
            borderColor,
          }),
        },
        style,
      ]}
    >
      <Image
        source={IMAGES.sogyo}
        style={[
          {
            width: size,
            height: size,
            borderRadius: size / 2,
          },
          imageStyle,
        ]}
        resizeMode="cover"
      />
    </View>
  );
}