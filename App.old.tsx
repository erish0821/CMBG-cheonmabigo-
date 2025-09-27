import React from 'react';
import { StatusBar } from 'expo-status-bar';
import './global.css';

// 디자인 시스템 컴포넌트 임포트
import {
  Button,
  Card,
  ProgressBar,
  Input,
  H1,
  H2,
  H3,
  BodyText,
  Caption,
  Label,
  HomeIcon,
  ChatIcon,
  AnalyticsIcon,
  SearchIcon,
  MicrophoneIcon,
} from './src/components/ui';
import { Screen, Container, SectionContainer } from './src/components/layout';

export default function App() {
  return (
    <Screen
      title="천마비고"
      subtitle="디자인 시스템 테스트"
      background="white"
      safeArea={true}
      scrollable={true}
    >
      {/* 타이포그래피 테스트 */}
      <SectionContainer>
        <H2 className="mb-4">타이포그래피 시스템</H2>
        <Card className="mb-4">
          <H3 className="mb-2">제목 스타일</H3>
          <H1 className="mb-2">H1 제목</H1>
          <H2 className="mb-2">H2 제목</H2>
          <H3 className="mb-2">H3 제목</H3>
          <BodyText className="mb-2">기본 본문 텍스트</BodyText>
          <BodyText variant="secondary" className="mb-2">
            보조 본문 텍스트
          </BodyText>
          <Caption className="mb-2">캡션 텍스트</Caption>
          <Label>라벨 텍스트</Label>
        </Card>
      </SectionContainer>

      {/* 버튼 테스트 */}
      <SectionContainer>
        <H2 className="mb-4">버튼 시스템</H2>
        <Card className="mb-4">
          <H3 className="mb-4">버튼 변형</H3>
          <Container className="mb-3 flex-row space-x-2">
            <Button title="기본 버튼" variant="primary" className="flex-1" />
            <Button title="보조 버튼" variant="secondary" className="flex-1" />
          </Container>
          <Button title="외곽선 버튼" variant="outline" className="mb-3" />

          <H3 className="mb-4">버튼 크기</H3>
          <Button title="작은 버튼" size="sm" className="mb-2" />
          <Button title="중간 버튼" size="md" className="mb-2" />
          <Button title="큰 버튼" size="lg" />
        </Card>
      </SectionContainer>

      {/* 입력 필드 테스트 */}
      <SectionContainer>
        <H2 className="mb-4">입력 시스템</H2>
        <Card className="mb-4">
          <Input
            label="기본 입력"
            placeholder="여기에 입력하세요"
            className="mb-4"
          />
          <Input
            label="검색 입력"
            placeholder="검색..."
            leftIcon={<SearchIcon size="sm" color="gray" />}
            className="mb-4"
          />
          <Input
            label="비밀번호 입력"
            placeholder="비밀번호"
            isPassword
            className="mb-4"
          />
          <Input
            label="오류가 있는 입력"
            placeholder="잘못된 입력"
            error="이 필드는 필수입니다"
            className="mb-4"
          />
        </Card>
      </SectionContainer>

      {/* 아이콘 테스트 */}
      <SectionContainer>
        <H2 className="mb-4">아이콘 시스템</H2>
        <Card className="mb-4">
          <H3 className="mb-4">기본 아이콘</H3>
          <Container className="mb-4 flex-row space-x-4">
            <HomeIcon size="lg" color="primary" />
            <ChatIcon size="lg" color="secondary" />
            <AnalyticsIcon size="lg" color="success" />
            <SearchIcon size="lg" color="warning" />
            <MicrophoneIcon size="lg" color="error" />
          </Container>

          <H3 className="mb-4">아이콘 크기</H3>
          <Container className="flex-row items-center space-x-2">
            <HomeIcon size="xs" color="gray" />
            <HomeIcon size="sm" color="gray" />
            <HomeIcon size="md" color="gray" />
            <HomeIcon size="lg" color="gray" />
            <HomeIcon size="xl" color="gray" />
          </Container>
        </Card>
      </SectionContainer>

      {/* 진행률 표시기 테스트 */}
      <SectionContainer>
        <H2 className="mb-4">진행률 표시기</H2>
        <Card className="mb-4">
          <Label className="mb-2">저축 목표 65%</Label>
          <ProgressBar progress={65} className="mb-4" />

          <Label className="mb-2">지출 한도 80%</Label>
          <ProgressBar
            progress={80}
            color="warning"
            showGradient={false}
            className="mb-4"
          />

          <Label className="mb-2">완료 100%</Label>
          <ProgressBar progress={100} color="success" className="mb-4" />
        </Card>
      </SectionContainer>

      {/* 카드 테스트 */}
      <SectionContainer>
        <H2 className="mb-4">카드 시스템</H2>
        <Card variant="default" className="mb-3">
          <H3 className="mb-2">기본 카드</H3>
          <BodyText variant="secondary">
            기본 그림자가 적용된 카드입니다.
          </BodyText>
        </Card>

        <Card variant="elevated" className="mb-3">
          <H3 className="mb-2">엘리베이션 카드</H3>
          <BodyText variant="secondary">
            강한 그림자가 적용된 카드입니다.
          </BodyText>
        </Card>

        <Card variant="outlined" className="mb-3">
          <H3 className="mb-2">외곽선 카드</H3>
          <BodyText variant="secondary">외곽선이 적용된 카드입니다.</BodyText>
        </Card>
      </SectionContainer>

      <StatusBar style="dark" />
    </Screen>
  );
}
