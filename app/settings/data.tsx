import React, { useState } from 'react';
import { View, ScrollView, Alert, Share, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../src/stores/authStore';
import {
  Screen,
  Container,
  SectionContainer,
} from '../../src/components/layout';
import {
  H1,
  H2,
  H3,
  BodyText,
  Caption,
  Label,
} from '../../src/components/ui/Typography';
import { Card } from '../../src/components/ui/Card';
import { Button } from '../../src/components/ui/Button';
import { Input } from '../../src/components/ui/Input';
import { ProgressBar } from '../../src/components/ui/ProgressBar';

export default function DataManagementScreen() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [isExporting, setIsExporting] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [confirmText, setConfirmText] = useState('');

  // 데이터 통계 (실제 구현 시 API에서 가져와야 함)
  const dataStats = {
    transactions: 247,
    categories: 8,
    budgets: 6,
    goals: 2,
    totalSize: '2.3 MB',
    lastBackup: '2024-03-04 14:30',
  };

  const handleExportData = async () => {
    setIsExporting(true);
    setExportProgress(0);

    try {
      // 실제 구현 시 API 호출
      // const exportData = await dataService.exportUserData();

      // 진행률 시뮬레이션
      for (let i = 0; i <= 100; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 100));
        setExportProgress(i);
      }

      // CSV 데이터 생성 (실제로는 서버에서)
      const csvData = generateSampleCSV();

      if (Platform.OS === 'web') {
        // 웹에서 파일 다운로드
        const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `천마비고_거래내역_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        URL.revokeObjectURL(link.href);
      } else {
        // 모바일에서 공유
        await Share.share({
          message: csvData,
          title: '천마비고 거래 내역',
        });
      }

      if (typeof window !== 'undefined') {
        alert('데이터 내보내기가 완료되었습니다!');
      } else {
        Alert.alert('완료', '데이터 내보내기가 완료되었습니다!');
      }

    } catch (error: any) {
      console.error('데이터 내보내기 오류:', error);

      if (typeof window !== 'undefined') {
        alert('데이터 내보내기에 실패했습니다. 다시 시도해주세요.');
      } else {
        Alert.alert('오류', '데이터 내보내기에 실패했습니다. 다시 시도해주세요.');
      }
    } finally {
      setIsExporting(false);
      setExportProgress(0);
    }
  };

  const generateSampleCSV = () => {
    const header = '날짜,카테고리,내용,금액,메모\n';
    const sampleData = [
      '2024-03-04,식비,김치찌개,8000,점심',
      '2024-03-04,교통비,지하철,1500,출근',
      '2024-03-03,쇼핑,마트,35000,장보기',
      '2024-03-03,문화생활,영화,15000,아바타 관람',
      '2024-03-02,식비,스타벅스,4500,아메리카노',
    ].join('\n');

    return header + sampleData;
  };

  const handleResetData = async () => {
    if (confirmText !== '천마비고 데이터 삭제') {
      if (typeof window !== 'undefined') {
        alert('확인 문구를 정확히 입력해주세요.');
      } else {
        Alert.alert('오류', '확인 문구를 정확히 입력해주세요.');
      }
      return;
    }

    const finalConfirm = () => {
      setIsResetting(true);

      // 실제 구현 시 API 호출
      setTimeout(async () => {
        try {
          // await dataService.resetUserData();

          if (typeof window !== 'undefined') {
            alert('데이터 초기화가 완료되었습니다. 로그아웃됩니다.');
          } else {
            Alert.alert(
              '초기화 완료',
              '데이터 초기화가 완료되었습니다. 로그아웃됩니다.',
              [{ text: '확인', onPress: () => logout() }]
            );
          }

          await logout();
          router.replace('/');
        } catch (error) {
          console.error('데이터 초기화 오류:', error);
          if (typeof window !== 'undefined') {
            alert('데이터 초기화에 실패했습니다.');
          } else {
            Alert.alert('오류', '데이터 초기화에 실패했습니다.');
          }
        } finally {
          setIsResetting(false);
        }
      }, 2000);
    };

    if (typeof window !== 'undefined') {
      if (confirm('정말로 모든 데이터를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
        finalConfirm();
      }
    } else {
      Alert.alert(
        '데이터 초기화',
        '정말로 모든 데이터를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.',
        [
          { text: '취소', style: 'cancel' },
          { text: '삭제', style: 'destructive', onPress: finalConfirm },
        ]
      );
    }
  };

  const handleCloudBackup = async () => {
    // 클라우드 백업 기능 (향후 구현)
    if (typeof window !== 'undefined') {
      alert('클라우드 백업 기능은 곧 출시 예정입니다.');
    } else {
      Alert.alert('알림', '클라우드 백업 기능은 곧 출시 예정입니다.');
    }
  };

  const handleCloudRestore = async () => {
    // 클라우드 복원 기능 (향후 구현)
    if (typeof window !== 'undefined') {
      alert('클라우드 복원 기능은 곧 출시 예정입니다.');
    } else {
      Alert.alert('알림', '클라우드 복원 기능은 곧 출시 예정입니다.');
    }
  };

  return (
    <Screen
      title="데이터 관리"
      subtitle="데이터 백업, 내보내기, 초기화를 관리하세요"
      safeArea={true}
      scrollable={true}

    >
      {/* 데이터 현황 */}
      <SectionContainer>
        <H2 className="mb-4">데이터 현황</H2>

        <Card className="mb-4">
          <H3 className="mb-3">저장된 데이터</H3>
          <View className="space-y-3">
            <View className="flex-row justify-between">
              <BodyText className="text-gray-600">거래 내역</BodyText>
              <BodyText className="font-medium">{dataStats.transactions}건</BodyText>
            </View>
            <View className="flex-row justify-between">
              <BodyText className="text-gray-600">사용 중인 카테고리</BodyText>
              <BodyText className="font-medium">{dataStats.categories}개</BodyText>
            </View>
            <View className="flex-row justify-between">
              <BodyText className="text-gray-600">예산 설정</BodyText>
              <BodyText className="font-medium">{dataStats.budgets}개</BodyText>
            </View>
            <View className="flex-row justify-between">
              <BodyText className="text-gray-600">저축 목표</BodyText>
              <BodyText className="font-medium">{dataStats.goals}개</BodyText>
            </View>
            <View className="flex-row justify-between border-t border-gray-200 pt-3">
              <BodyText className="text-gray-600">총 데이터 크기</BodyText>
              <BodyText className="font-bold text-primary-600">{dataStats.totalSize}</BodyText>
            </View>
          </View>
        </Card>

        <Card className="bg-info-50">
          <View className="flex-row items-center">
            <BodyText className="text-info-600 text-lg mr-2">💾</BodyText>
            <View className="flex-1">
              <BodyText className="text-info-800 font-medium">마지막 백업</BodyText>
              <BodyText className="text-info-700 text-sm">{dataStats.lastBackup}</BodyText>
            </View>
          </View>
        </Card>
      </SectionContainer>

      {/* 데이터 내보내기 */}
      <SectionContainer>
        <H2 className="mb-4">데이터 내보내기</H2>

        <Card className="mb-4">
          <H3 className="mb-3">CSV 파일로 내보내기</H3>
          <BodyText className="text-gray-600 text-sm mb-4">
            모든 거래 내역을 CSV 파일로 내보내어 Excel이나 다른 가계부 앱에서
            사용할 수 있습니다.
          </BodyText>

          {isExporting && (
            <View className="mb-4">
              <View className="flex-row items-center justify-between mb-2">
                <BodyText className="text-sm">내보내는 중...</BodyText>
                <BodyText className="text-sm">{exportProgress}%</BodyText>
              </View>
              <ProgressBar
                progress={exportProgress}
                className="h-2"
                showGradient={true}
              />
            </View>
          )}

          <Button
            title={isExporting ? "내보내는 중..." : "CSV 파일 내보내기"}
            variant="primary"
            onPress={handleExportData}
            disabled={isExporting}
            leftIcon={isExporting ? undefined : "📄"}
          />
        </Card>

        <Card className="bg-success-50">
          <H3 className="text-success-800 mb-2">📋 내보내기 포함 항목</H3>
          <View className="space-y-1">
            <BodyText className="text-success-700 text-sm">• 모든 거래 내역 (날짜, 카테고리, 금액, 메모)</BodyText>
            <BodyText className="text-success-700 text-sm">• 예산 설정 정보</BodyText>
            <BodyText className="text-success-700 text-sm">• 카테고리 분류 정보</BodyText>
            <BodyText className="text-success-700 text-sm">• 저축 목표 및 달성률</BodyText>
          </View>
        </Card>
      </SectionContainer>

      {/* 클라우드 백업 (향후 기능) */}
      <SectionContainer>
        <H2 className="mb-4">클라우드 백업 (준비 중)</H2>

        <Card className="mb-4">
          <H3 className="mb-3 text-gray-500">자동 백업 설정</H3>
          <BodyText className="text-gray-500 text-sm mb-4">
            구글 드라이브나 iCloud에 자동으로 데이터를 백업하는 기능입니다.
            곧 출시 예정입니다.
          </BodyText>

          <View className="flex-row space-x-3">
            <Button
              title="클라우드 백업"
              variant="outline"
              className="flex-1"
              onPress={handleCloudBackup}
              disabled={true}
            />
            <Button
              title="백업에서 복원"
              variant="outline"
              className="flex-1"
              onPress={handleCloudRestore}
              disabled={true}
            />
          </View>
        </Card>
      </SectionContainer>

      {/* 데이터 초기화 */}
      <SectionContainer>
        <H2 className="mb-4">데이터 초기화</H2>

        <Card className="border-2 border-error-200">
          <View className="items-center mb-4">
            <BodyText className="text-error-600 text-3xl mb-2">⚠️</BodyText>
            <H3 className="text-error-800 text-center">위험한 작업</H3>
            <BodyText className="text-error-700 text-center text-sm">
              이 작업은 되돌릴 수 없습니다
            </BodyText>
          </View>

          <BodyText className="text-gray-700 text-sm mb-4 leading-6">
            모든 거래 내역, 예산 설정, 저축 목표, 개인 설정이 영구적으로 삭제됩니다.
            삭제 전에 반드시 데이터를 내보내기하여 백업해두세요.
          </BodyText>

          <BodyText className="text-error-700 text-sm mb-3 font-medium">
            정말로 삭제하시려면 아래 문구를 정확히 입력하세요:
          </BodyText>
          <BodyText className="text-error-800 font-bold mb-2">
            천마비고 데이터 삭제
          </BodyText>

          <Input
            placeholder="위 문구를 정확히 입력하세요"
            value={confirmText}
            onChangeText={setConfirmText}
            className="mb-4"
          />

          <Button
            title={isResetting ? "삭제 중..." : "모든 데이터 삭제"}
            variant="outline"
            className="border-error-500 text-error-700"
            onPress={handleResetData}
            disabled={isResetting || confirmText !== '천마비고 데이터 삭제'}
          />
        </Card>
      </SectionContainer>

      {/* 개인정보 보호 */}
      <SectionContainer>
        <Card className="bg-primary-50">
          <H3 className="text-primary-800 mb-2">🔒 개인정보 보호</H3>
          <BodyText className="text-primary-700 text-sm leading-6">
            천마비고는 사용자의 개인정보와 재정 데이터를 안전하게 보호합니다.
            모든 데이터는 암호화되어 저장되며, 사용자의 동의 없이 외부에 공유되지 않습니다.
            언제든지 데이터를 내보내거나 삭제할 수 있는 권리가 있습니다.
          </BodyText>
        </Card>
      </SectionContainer>
    </Screen>
  );
}