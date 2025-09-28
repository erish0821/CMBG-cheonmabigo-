import React, { useState, useMemo } from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { H2, H3, BodyText, Caption } from '../ui/Typography';
import { Card } from '../ui/Card';

interface DayData {
  date: Date;
  income: number;
  expense: number;
  netAmount: number;
  transactionCount: number;
}

interface DailyCalendarChartProps {
  data: DayData[];
  selectedDate?: Date;
  onDatePress?: (date: Date, dayData: DayData | null) => void;
}

export function DailyCalendarChart({ data, selectedDate, onDatePress }: DailyCalendarChartProps) {
  const [currentMonth, setCurrentMonth] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });

  // 달력 데이터 생성
  const calendarData = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    // 이번 달의 첫째 날과 마지막 날
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    // 달력에 표시할 첫 번째 날 (이전 달의 마지막 주)
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    // 달력에 표시할 마지막 날 (다음 달의 첫 주)
    const endDate = new Date(lastDay);
    endDate.setDate(endDate.getDate() + (6 - lastDay.getDay()));

    // 날짜별 데이터 맵 생성
    const dataMap = new Map<string, DayData>();
    data.forEach(dayData => {
      const dateKey = dayData.date.toISOString().split('T')[0];
      dataMap.set(dateKey, dayData);
    });

    // 달력 날짜들 생성
    const days: Array<{
      date: Date;
      dayData: DayData | null;
      isCurrentMonth: boolean;
      isToday: boolean;
      isSelected: boolean;
    }> = [];

    const today = new Date();
    const todayKey = today.toISOString().split('T')[0];
    const selectedKey = selectedDate?.toISOString().split('T')[0];

    const current = new Date(startDate);
    while (current <= endDate) {
      const dateKey = current.toISOString().split('T')[0];
      const dayData = dataMap.get(dateKey) || null;

      days.push({
        date: new Date(current),
        dayData,
        isCurrentMonth: current.getMonth() === month,
        isToday: dateKey === todayKey,
        isSelected: dateKey === selectedKey,
      });

      current.setDate(current.getDate() + 1);
    }

    return days;
  }, [currentMonth, data, selectedDate]);

  // 이전/다음 달로 이동
  const goToPreviousMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  // 금액 포맷 (천 단위 콤마 + 원 표시)
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('ko-KR').format(Math.abs(amount));
  };

  // 날짜 렌더링
  const renderDay = (day: any) => {
    const { date, dayData, isCurrentMonth, isToday, isSelected } = day;
    const hasData = dayData && (dayData.income > 0 || dayData.expense > 0);

    let backgroundColor = 'bg-transparent';
    let textColor = 'text-gray-400';
    let borderColor = 'border-transparent';

    if (isSelected) {
      backgroundColor = 'bg-primary-600';
      textColor = 'text-white';
    } else if (isToday) {
      borderColor = 'border-primary-600';
      textColor = isCurrentMonth ? 'text-primary-600' : 'text-gray-400';
    } else if (isCurrentMonth) {
      textColor = 'text-gray-900';
    }

    return (
      <TouchableOpacity
        key={date.toISOString()}
        className={`flex-1 items-center justify-center border ${borderColor} ${backgroundColor} rounded-lg m-0.5 min-h-[48px]`}
        onPress={() => onDatePress?.(date, dayData)}
        disabled={!isCurrentMonth}
        style={{ aspectRatio: 1 }}
      >
        <View className="items-center justify-center flex-1 w-full p-1">
          <BodyText className={`text-sm font-medium ${textColor} mb-0.5`}>
            {date.getDate()}
          </BodyText>

          {hasData && isCurrentMonth && (
            <View className="w-full">
              {dayData.income > 0 && (
                <Text style={{
                  fontSize: 10,
                  color: '#15803d',
                  fontWeight: '500',
                  textAlign: 'center',
                  lineHeight: 12
                }}>
                  +{formatAmount(dayData.income)}
                </Text>
              )}
              {dayData.expense > 0 && (
                <Text style={{
                  fontSize: 10,
                  color: '#b91c1c',
                  fontWeight: '500',
                  textAlign: 'center',
                  lineHeight: 12
                }}>
                  -{formatAmount(dayData.expense)}
                </Text>
              )}
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  // 주별로 그룹화
  const weeks = [];
  for (let i = 0; i < calendarData.length; i += 7) {
    weeks.push(calendarData.slice(i, i + 7));
  }

  return (
    <Card className="mb-4">
      <View className="space-y-4">
        {/* 헤더 */}
        <View className="flex-row items-center justify-between">
          <TouchableOpacity
            onPress={goToPreviousMonth}
            className="p-2 rounded-full bg-gray-100"
          >
            <Text className="text-lg">‹</Text>
          </TouchableOpacity>

          <H3 className="font-bold">
            {currentMonth.toLocaleDateString('ko-KR', {
              year: 'numeric',
              month: 'long'
            })}
          </H3>

          <TouchableOpacity
            onPress={goToNextMonth}
            className="p-2 rounded-full bg-gray-100"
          >
            <Text className="text-lg">›</Text>
          </TouchableOpacity>
        </View>

        {/* 요일 헤더 */}
        <View className="flex-row">
          {['일', '월', '화', '수', '목', '금', '토'].map((day, index) => (
            <View key={day} className="flex-1 items-center py-2">
              <Caption className={`font-medium ${
                index === 0 ? 'text-red-500' :
                index === 6 ? 'text-blue-500' : 'text-gray-600'
              }`}>
                {day}
              </Caption>
            </View>
          ))}
        </View>

        {/* 달력 */}
        <View className="space-y-1">
          {weeks.map((week, weekIndex) => (
            <View key={weekIndex} className="flex-row">
              {week.map(renderDay)}
            </View>
          ))}
        </View>

        {/* 범례 */}
        <View className="pt-4 border-t border-gray-200">
          <View className="flex-row items-center justify-center space-x-4">
            <View className="flex-row items-center">
              <View className="w-3 h-3 bg-green-600 rounded mr-2" />
              <Caption className="text-gray-600">수입</Caption>
            </View>
            <View className="flex-row items-center">
              <View className="w-3 h-3 bg-red-600 rounded mr-2" />
              <Caption className="text-gray-600">지출</Caption>
            </View>
            <View className="flex-row items-center">
              <View className="w-3 h-3 border-2 border-primary-600 rounded mr-2" />
              <Caption className="text-gray-600">오늘</Caption>
            </View>
          </View>
        </View>
      </View>
    </Card>
  );
}