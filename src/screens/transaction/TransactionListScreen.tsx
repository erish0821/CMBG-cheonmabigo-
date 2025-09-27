/**
 * 거래 목록 화면
 * 필터링, 검색, 무한 스크롤 지원
 */

import React, { useState, useEffect, useCallback } from 'react';
import { View, FlatList, RefreshControl, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Transaction, TransactionFilter, CategoryType } from '../../types/transaction';
import { transactionStorage } from '../../services/storage/TransactionStorage';
import { TransactionCard } from '../../components/transaction/TransactionCard';
import { CategoryPicker } from '../../components/transaction/CategoryPicker';
import { Screen, Container } from '../../components/layout';
import { H2, BodyText, Caption } from '../../components/ui/Typography';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

export function TransactionListScreen() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryType | undefined>();
  const [showFilters, setShowFilters] = useState(false);
  const [filter, setFilter] = useState<TransactionFilter>({});

  // 거래 목록 로드
  const loadTransactions = useCallback(async () => {
    try {
      const allTransactions = await transactionStorage.getAllTransactions();
      setTransactions(allTransactions);
      setFilteredTransactions(allTransactions);
    } catch (error) {
      console.error('Failed to load transactions:', error);
      Alert.alert('오류', '거래 내역을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // 필터 적용
  const applyFilters = useCallback(async () => {
    try {
      const currentFilter: TransactionFilter = {
        ...filter,
        searchText: searchText.trim() || undefined,
        categories: selectedCategory ? [selectedCategory] : undefined,
      };

      const filtered = await transactionStorage.getTransactions(currentFilter);
      setFilteredTransactions(filtered);
    } catch (error) {
      console.error('Failed to filter transactions:', error);
    }
  }, [filter, searchText, selectedCategory]);

  // 초기 로드
  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  // 필터 변경 시 자동 적용
  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  // 새로고침
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadTransactions();
  }, [loadTransactions]);

  // 거래 상세 보기
  const handleTransactionPress = (transaction: Transaction) => {
    router.push(`/transaction/${transaction.id}`);
  };

  // 거래 삭제
  const handleDeleteTransaction = (transaction: Transaction) => {
    Alert.alert(
      '거래 삭제',
      `"${transaction.description}" 거래를 삭제하시겠습니까?`,
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            try {
              await transactionStorage.deleteTransaction(transaction.id);
              await loadTransactions();
            } catch (error) {
              Alert.alert('오류', '거래 삭제에 실패했습니다.');
            }
          },
        },
      ]
    );
  };

  // 필터 초기화
  const clearFilters = () => {
    setSearchText('');
    setSelectedCategory(undefined);
    setFilter({});
    setShowFilters(false);
  };

  // 빈 목록 표시
  const renderEmptyList = () => (
    <View className="flex-1 items-center justify-center p-8">
      <BodyText className="mb-4 text-center text-gray-500">
        {searchText || selectedCategory
          ? '검색 결과가 없습니다.'
          : '아직 거래 내역이 없습니다.\n음성이나 텍스트로 거래를 기록해보세요!'}
      </BodyText>
      <Button
        title="채팅으로 기록하기"
        variant="primary"
        onPress={() => router.push('/chat')}
      />
    </View>
  );

  // 거래 카드 렌더링
  const renderTransaction = ({ item }: { item: Transaction }) => (
    <TransactionCard
      transaction={item}
      onPress={() => handleTransactionPress(item)}
      onDelete={() => handleDeleteTransaction(item)}
      compact={true}
    />
  );

  // 목록 헤더
  const renderListHeader = () => (
    <View className="mb-4">
      {/* 검색바 */}
      <View className="mb-4">
        <Input
          placeholder="거래 내역 검색..."
          value={searchText}
          onChangeText={setSearchText}
          className="mb-2"
        />
        <View className="flex-row items-center justify-between">
          <Button
            title={showFilters ? '필터 숨기기' : '필터 보기'}
            variant="outline"
            size="sm"
            onPress={() => setShowFilters(!showFilters)}
          />
          {(searchText || selectedCategory) && (
            <Button
              title="필터 초기화"
              variant="outline"
              size="sm"
              onPress={clearFilters}
            />
          )}
        </View>
      </View>

      {/* 필터 섹션 */}
      {showFilters && (
        <View className="mb-4 rounded-lg bg-gray-50 p-4">
          <Caption className="mb-3 font-semibold text-gray-700">카테고리별 필터</Caption>
          <CategoryPicker
            selectedCategory={selectedCategory}
            onCategorySelect={(category) => {
              setSelectedCategory(
                selectedCategory === category ? undefined : category
              );
            }}
            showSubcategories={false}
          />
        </View>
      )}

      {/* 통계 정보 */}
      <View className="mb-4 flex-row justify-between rounded-lg bg-primary-50 p-4">
        <View className="items-center">
          <BodyText className="font-bold text-primary-700">
            {filteredTransactions.length}
          </BodyText>
          <Caption className="text-primary-600">총 거래</Caption>
        </View>
        <View className="items-center">
          <BodyText className="font-bold text-red-600">
            ₩{filteredTransactions
              .filter(tx => !tx.isIncome)
              .reduce((sum, tx) => sum + Math.abs(tx.amount), 0)
              .toLocaleString()}
          </BodyText>
          <Caption className="text-red-500">총 지출</Caption>
        </View>
        <View className="items-center">
          <BodyText className="font-bold text-green-600">
            ₩{filteredTransactions
              .filter(tx => tx.isIncome)
              .reduce((sum, tx) => sum + tx.amount, 0)
              .toLocaleString()}
          </BodyText>
          <Caption className="text-green-500">총 수입</Caption>
        </View>
      </View>
    </View>
  );

  return (
    <Screen safeArea={true} scrollable={false}>
      <Container>
        <H2 className="mb-4">거래 내역</H2>

        <FlatList
          data={filteredTransactions}
          renderItem={renderTransaction}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={renderListHeader}
          ListEmptyComponent={renderEmptyList}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#7C3AED']}
            />
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingBottom: 20,
            flexGrow: 1,
          }}
        />
      </Container>
    </Screen>
  );
}