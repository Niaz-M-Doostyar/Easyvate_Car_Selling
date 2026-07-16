import React from 'react';
import { Text } from './LocalizedPaper';
import { useLanguage } from '../contexts/LanguageContext';

export default function ResponsiveAmount({ children, style, numberOfLines = 1, minimumFontScale = 0.55, ...props }) {
  const { fontFamily, isRTL } = useLanguage();
  return (
    <Text
      {...props}
      numberOfLines={numberOfLines}
      adjustsFontSizeToFit
      minimumFontScale={minimumFontScale}
      style={[{
        flexShrink: 1,
        fontFamily,
        writingDirection: isRTL ? 'rtl' : 'ltr',
        textAlign: 'right',
      }, style]}
    >
      {children}
    </Text>
  );
}
