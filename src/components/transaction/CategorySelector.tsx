import React, { useState } from 'react';
import { View, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { CATEGORIES } from '../../constants/categories';
import { CategoryType } from '../../types/transaction';
import { H3, BodyText, Caption } from '../ui/Typography';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

interface CategorySelectorProps {
  selectedCategory?: CategoryType;
  onSelect: (category: CategoryType) => void;
  label?: string;
}

export const CategorySelector: React.FC<CategorySelectorProps> = ({
  selectedCategory,
  onSelect,
  label = "카테고리",
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);

  const selectedCategoryInfo = selectedCategory ? CATEGORIES[selectedCategory] : null;

  const handleSelect = (category: CategoryType) => {
    onSelect(category);
    setIsModalVisible(false);
  };

  const categoryEntries = Object.entries(CATEGORIES) as [CategoryType, typeof CATEGORIES[CategoryType]][];

  return (
    <>
      <View>
        <Caption className="text-gray-600 mb-2">{label}</Caption>
        <TouchableOpacity
          onPress={() => setIsModalVisible(true)}
          className="border border-gray-300 rounded-lg p-4 bg-white"
        >
          {selectedCategoryInfo ? (
            <View className="flex-row items-center">
              <BodyText className="text-2xl mr-3">{selectedCategoryInfo.icon}</BodyText>
              <View className="flex-1">
                <BodyText className="font-semibold">{selectedCategoryInfo.name}</BodyText>
                <Caption className="text-gray-600">
                  {selectedCategoryInfo.subcategories.slice(0, 2).join(', ')}
                  {selectedCategoryInfo.subcategories.length > 2 ? ' 외' : ''}
                </Caption>
              </View>
            </View>
          ) : (
            <BodyText className="text-gray-500">카테고리를 선택하세요</BodyText>
          )}
        </TouchableOpacity>
      </View>

      <Modal
        visible={isModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View className="flex-1 bg-background">
          {/* Header */}
          <View className="px-6 py-4 bg-white border-b border-gray-200">
            <H3 className="text-center">카테고리 선택</H3>
            <Caption className="text-center text-gray-600 mt-1">
              적절한 카테고리를 선택하세요
            </Caption>
          </View>

          <ScrollView className="flex-1 p-6">
            <View className="space-y-3">
              {categoryEntries.map(([categoryKey, categoryData]) => (
                <TouchableOpacity
                  key={categoryKey}
                  onPress={() => handleSelect(categoryKey)}
                >
                  <Card className={`${
                    selectedCategory === categoryKey
                      ? 'border-primary-500 bg-primary-50'
                      : ''
                  }`}>
                    <View className="flex-row items-center">
                      <View
                        className="w-12 h-12 rounded-full mr-4 items-center justify-center"
                        style={{ backgroundColor: categoryData.color + '20' }}
                      >
                        <BodyText className="text-2xl">{categoryData.icon}</BodyText>
                      </View>
                      <View className="flex-1">
                        <BodyText className="font-semibold text-lg">
                          {categoryData.name}
                        </BodyText>
                        <Caption className="text-gray-600 mt-1">
                          {categoryData.subcategories.slice(0, 3).join(', ')}
                          {categoryData.subcategories.length > 3 ? ' 외' : ''}
                        </Caption>
                      </View>
                      {selectedCategory === categoryKey && (
                        <View className="w-6 h-6 rounded-full bg-primary-500 items-center justify-center">
                          <BodyText className="text-white text-sm">✓</BodyText>
                        </View>
                      )}
                    </View>
                  </Card>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          {/* Footer */}
          <View className="p-6 bg-white border-t border-gray-200">
            <Button
              title="취소"
              variant="outline"
              onPress={() => setIsModalVisible(false)}
            />
          </View>
        </View>
      </Modal>
    </>
  );
};