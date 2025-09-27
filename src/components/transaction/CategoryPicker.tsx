/**
 * 카테고리 선택기 컴포넌트
 */

import React from 'react';
import { View, ScrollView, Pressable } from 'react-native';
import { CategoryType } from '../../types/transaction';
import { CATEGORIES, CATEGORY_LIST } from '../../constants/categories';
import { BodyText, Caption } from '../ui/Typography';

export interface CategoryPickerProps {
  selectedCategory?: CategoryType;
  onCategorySelect: (category: CategoryType) => void;
  showSubcategories?: boolean;
  selectedSubcategory?: string;
  onSubcategorySelect?: (subcategory: string) => void;
}

export function CategoryPicker({
  selectedCategory,
  onCategorySelect,
  showSubcategories = true,
  selectedSubcategory,
  onSubcategorySelect,
}: CategoryPickerProps) {
  const selectedCategoryInfo = selectedCategory ? CATEGORIES[selectedCategory] : null;

  return (
    <View>
      {/* 메인 카테고리 */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="mb-4"
      >
        <View className="flex-row space-x-2 px-4">
          {CATEGORY_LIST.map((category) => {
            const info = CATEGORIES[category];
            const isSelected = selectedCategory === category;

            return (
              <Pressable
                key={category}
                onPress={() => onCategorySelect(category)}
                className={`items-center rounded-lg p-3 ${
                  isSelected
                    ? 'bg-primary-100 border-2 border-primary-500'
                    : 'bg-gray-100 border-2 border-transparent'
                }`}
                style={{ minWidth: 80 }}
              >
                <BodyText className="mb-1 text-2xl">{info.icon}</BodyText>
                <Caption
                  className={`text-center ${
                    isSelected ? 'text-primary-700 font-semibold' : 'text-gray-600'
                  }`}
                  numberOfLines={1}
                >
                  {info.name}
                </Caption>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      {/* 서브카테고리 */}
      {showSubcategories && selectedCategoryInfo && selectedCategoryInfo.subcategories.length > 0 && (
        <View className="px-4">
          <Caption className="mb-2 text-gray-600">세부 카테고리</Caption>
          <View className="flex-row flex-wrap">
            {selectedCategoryInfo.subcategories.map((subcategory, index) => {
              const isSelected = selectedSubcategory === subcategory;

              return (
                <Pressable
                  key={index}
                  onPress={() => onSubcategorySelect?.(subcategory)}
                  className={`mb-2 mr-2 rounded-full px-3 py-2 ${
                    isSelected
                      ? 'bg-primary-100 border border-primary-500'
                      : 'bg-gray-100 border border-gray-300'
                  }`}
                >
                  <Caption
                    className={
                      isSelected ? 'text-primary-700 font-medium' : 'text-gray-700'
                    }
                  >
                    {subcategory}
                  </Caption>
                </Pressable>
              );
            })}
          </View>
        </View>
      )}
    </View>
  );
}