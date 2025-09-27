# 게임화 요소 구현

사용자의 지속적인 재정 관리를 위한 성취 시스템, 포인트, 배지 등의 게임화 요소를 구현합니다.

## 실행할 작업

1. **게임화 데이터 모델**
   ```typescript
   interface Achievement {
     id: string;
     title: string;
     description: string;
     icon: string;
     category: AchievementCategory;
     condition: AchievementCondition;
     reward: Reward;
     isUnlocked: boolean;
     unlockedAt?: Date;
     progress: number; // 0-100
   }

   interface UserStats {
     totalTransactions: number;
     streakDays: number;
     totalSaved: number;
     budgetSuccessRate: number;
     categoriesUsed: number;
     level: number;
     experience: number;
     points: number;
   }

   interface Reward {
     type: 'points' | 'badge' | 'feature' | 'discount';
     value: number;
     description: string;
   }
   ```

2. **성취 시스템 구현**
   ```typescript
   // src/services/gamification/AchievementService.ts
   export class AchievementService {
     private static achievements: Achievement[] = [
       {
         id: 'first_transaction',
         title: '첫 걸음',
         description: '첫 거래를 기록했습니다',
         icon: '🎯',
         category: 'beginner',
         condition: { type: 'transaction_count', value: 1 },
         reward: { type: 'points', value: 10, description: '10 포인트' }
       },
       {
         id: 'budget_master',
         title: '예산 달인',
         description: '3개월 연속 예산을 지켰습니다',
         icon: '🏆',
         category: 'budget',
         condition: { type: 'budget_success_streak', value: 3 },
         reward: { type: 'badge', value: 1, description: '예산 마스터 배지' }
       },
       {
         id: 'savings_hero',
         title: '절약 영웅',
         description: '100만원을 절약했습니다',
         icon: '💰',
         category: 'savings',
         condition: { type: 'total_saved', value: 1000000 },
         reward: { type: 'feature', value: 1, description: '고급 분석 기능 해제' }
       }
     ];

     static checkAchievements(userStats: UserStats): Achievement[] {
       const newAchievements: Achievement[] = [];

       for (const achievement of this.achievements) {
         if (this.isConditionMet(achievement.condition, userStats)) {
           newAchievements.push(achievement);
         }
       }

       return newAchievements;
     }

     static calculateProgress(achievement: Achievement, userStats: UserStats): number {
       const condition = achievement.condition;
       const currentValue = this.getCurrentValue(condition.type, userStats);
       return Math.min(100, (currentValue / condition.value) * 100);
     }
   }
   ```

3. **레벨 및 경험치 시스템**
   ```typescript
   // src/services/gamification/LevelService.ts
   export class LevelService {
     private static readonly EXP_FORMULA = (level: number) => level * 100 + 50;

     static calculateLevel(experience: number): number {
       let level = 1;
       let requiredExp = 0;

       while (requiredExp <= experience) {
         requiredExp += this.EXP_FORMULA(level);
         level++;
       }

       return level - 1;
     }

     static getExpForNextLevel(currentLevel: number): number {
       return this.EXP_FORMULA(currentLevel + 1);
     }

     static getExpActions(): Record<string, number> {
       return {
         'transaction_recorded': 5,
         'budget_set': 10,
         'goal_created': 15,
         'goal_achieved': 50,
         'budget_maintained': 25,
         'ai_conversation': 2,
         'weekly_review': 20,
       };
     }

     static awardExperience(action: string, userStats: UserStats): number {
       const expGained = this.getExpActions()[action] || 0;
       const newExperience = userStats.experience + expGained;
       const newLevel = this.calculateLevel(newExperience);

       if (newLevel > userStats.level) {
         // 레벨업 이벤트 발생
         EventEmitter.emit('levelUp', { 
           oldLevel: userStats.level, 
           newLevel: newLevel 
         });
       }

       return expGained;
     }
   }
   ```

4. **연속 기록 (Streak) 시스템**
   ```typescript
   // src/services/gamification/StreakService.ts
   export class StreakService {
     static updateDailyStreak(lastActiveDate: Date, currentDate: Date): number {
       const daysDiff = this.getDaysDifference(lastActiveDate, currentDate);

       if (daysDiff === 1) {
         // 연속 기록 유지
         return 1; // 증가
       } else if (daysDiff === 0) {
         // 같은 날
         return 0; // 유지
       } else {
         // 연속 기록 끊김
         return -1; // 리셋
       }
     }

     static getStreakRewards(streakDays: number): Reward[] {
       const rewards: Reward[] = [];

       if (streakDays % 7 === 0) {
         rewards.push({
           type: 'points',
           value: streakDays * 2,
           description: `${streakDays}일 연속 기록 보너스`
         });
       }

       if (streakDays === 30) {
         rewards.push({
           type: 'badge',
           value: 1,
           description: '30일 연속 기록 배지'
         });
       }

       return rewards;
     }
   }
   ```

5. **포인트 및 리워드 시스템**
   ```typescript
   // src/services/gamification/RewardService.ts
   export class RewardService {
     static readonly POINT_ACTIONS = {
       'daily_login': 5,
       'transaction_recorded': 2,
       'budget_achievement': 50,
       'goal_completed': 100,
       'ai_interaction': 1,
       'friend_referral': 200,
     };

     static awardPoints(action: string, multiplier: number = 1): number {
       const basePoints = this.POINT_ACTIONS[action] || 0;
       return basePoints * multiplier;
     }

     static getAvailableRewards(): RewardItem[] {
       return [
         {
           id: 'premium_theme',
           name: '프리미엄 테마',
           cost: 500,
           type: 'cosmetic',
           description: '특별한 보라색 그라데이션 테마'
         },
         {
           id: 'advanced_analytics',
           name: '고급 분석',
           cost: 1000,
           type: 'feature',
           description: '상세한 지출 패턴 분석'
         },
         {
           id: 'export_data',
           name: '데이터 내보내기',
           cost: 200,
           type: 'utility',
           description: 'CSV/Excel 형태로 데이터 내보내기'
         }
       ];
     }
   }
   ```

6. **게임화 UI 컴포넌트**
   ```typescript
   // src/components/gamification/AchievementCard.tsx
   export const AchievementCard: React.FC<{ achievement: Achievement }> = ({ 
     achievement 
   }) => {
     return (
       <Card className="p-4 mb-3">
         <View className="flex-row items-center">
           <Text className="text-3xl mr-3">{achievement.icon}</Text>
           <View className="flex-1">
             <Text className="text-lg font-bold text-gray-900">
               {achievement.title}
             </Text>
             <Text className="text-sm text-gray-600">
               {achievement.description}
             </Text>
             {!achievement.isUnlocked && (
               <ProgressBar 
                 progress={achievement.progress} 
                 className="mt-2"
               />
             )}
           </View>
           {achievement.isUnlocked && (
             <Text className="text-green-500 font-bold">✓</Text>
           )}
         </View>
       </Card>
     );
   };

   // src/components/gamification/LevelProgress.tsx
   export const LevelProgress: React.FC<{ userStats: UserStats }> = ({ 
     userStats 
   }) => {
     const expForNext = LevelService.getExpForNextLevel(userStats.level);
     const progress = (userStats.experience % expForNext) / expForNext * 100;

     return (
       <Card className="p-4 bg-purple-50">
         <View className="flex-row items-center justify-between mb-2">
           <Text className="text-lg font-bold">레벨 {userStats.level}</Text>
           <Text className="text-sm text-gray-600">
             {userStats.experience} / {expForNext} EXP
           </Text>
         </View>
         <ProgressBar 
           progress={progress} 
           color="#7C3AED"
           height={8}
         />
       </Card>
     );
   };
   ```

7. **알림 및 피드백 시스템**
   ```typescript
   // src/services/gamification/NotificationService.ts
   export class GameNotificationService {
     static showAchievementUnlocked(achievement: Achievement) {
       showNotification({
         title: '🎉 성취 달성!',
         message: `"${achievement.title}" 배지를 획득했습니다!`,
         type: 'success',
         duration: 3000,
         actions: [
           {
             label: '보기',
             onPress: () => navigateToAchievements()
           }
         ]
       });
     }

     static showLevelUp(oldLevel: number, newLevel: number) {
       showNotification({
         title: '⬆️ 레벨업!',
         message: `레벨 ${newLevel}에 도달했습니다!`,
         type: 'success',
         duration: 3000
       });

       // 레벨업 애니메이션 트리거
       Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
     }

     static showStreakMilestone(days: number) {
       showNotification({
         title: '🔥 연속 기록',
         message: `${days}일 연속 기록을 달성했습니다!`,
         type: 'info',
         duration: 2000
       });
     }
   }
   ```

8. **도전 과제 시스템**
   ```typescript
   // src/services/gamification/ChallengeService.ts
   interface Challenge {
     id: string;
     title: string;
     description: string;
     duration: number; // days
     condition: ChallengeCondition;
     reward: Reward;
     startDate: Date;
     endDate: Date;
     participants: number;
     isActive: boolean;
   }

   export class ChallengeService {
     static getWeeklyChallenges(): Challenge[] {
       return [
         {
           id: 'no_coffee_week',
           title: '카페 없는 일주일',
           description: '일주일 동안 카페 지출 없이 버티기',
           duration: 7,
           condition: { type: 'category_spend_limit', category: 'cafe', limit: 0 },
           reward: { type: 'points', value: 300, description: '300 포인트' }
         },
         {
           id: 'budget_hero',
           title: '예산 영웅',
           description: '이번 주 모든 카테고리 예산 지키기',
           duration: 7,
           condition: { type: 'all_budgets_maintained' },
           reward: { type: 'badge', value: 1, description: '주간 예산 마스터' }
         }
       ];
     }

     static joinChallenge(challengeId: string, userId: string): boolean {
       // 도전 과제 참여 로직
       return true;
     }

     static checkChallengeProgress(challenge: Challenge, userStats: UserStats): number {
       // 도전 과제 진행률 계산
       return 0;
     }
   }
   ```

9. **소셜 기능**
   ```typescript
   // src/services/gamification/SocialService.ts
   export class SocialService {
     static shareAchievement(achievement: Achievement) {
       const message = `천마비고에서 "${achievement.title}" 성취를 달성했습니다! 🎉`;
       
       Share.share({
         message,
         url: 'https://cheonmabigo.app',
         title: '천마비고 성취 달성'
       });
     }

     static inviteFriend(referralCode: string) {
       const message = `천마비고 앱으로 쉽게 가계부를 관리해보세요! 추천 코드: ${referralCode}`;
       
       Share.share({
         message,
         url: `https://cheonmabigo.app/invite/${referralCode}`
       });
     }

     static getLeaderboard(): LeaderboardEntry[] {
       // 리더보드 데이터 (익명화)
       return [];
     }
   }
   ```

**게임화 요소 구성**:
- 성취 시스템: 47개 배지
- 레벨 시스템: 1-50 레벨
- 포인트 시스템: 다양한 활동으로 획득
- 연속 기록: 일일/주간/월간 스트릭
- 도전 과제: 주간/월간 챌린지
- 리워드 상점: 포인트로 기능 해제

**추가 인수**: $ARGUMENTS (특정 게임화 요소나 기능)

게임화 완료 후 `/15-testing` 명령어로 테스트를 구현하세요.