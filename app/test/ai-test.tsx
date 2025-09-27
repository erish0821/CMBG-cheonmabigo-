import React from 'react';
import { Screen } from '../../src/components/layout';
import { AITestComponent } from '../../src/components/test/AITestComponent';

export default function AITestScreen() {
  return (
    <Screen
      title="AI 테스트"
      subtitle="EXAONE 모델 API 연동 테스트"
      safeArea={true}
      scrollable={false}
    >
      <AITestComponent />
    </Screen>
  );
}
