# 천마비고 Development Guide

**중요: 모든 설명과 대화는 한국어로 진행해주세요. 개발자가 영어를 잘 못하므로 반드시 한국어로 응답하고 설명해주시기 바랍니다.**

## Project Overview

천마비고 is a conversational AI financial coach mobile application that revolutionizes personal finance management through natural language interaction. Users can manage their finances by simply talking to an AI coach, eliminating the complexity of traditional budgeting apps.

### Key Features
- **Conversational Transaction Input**: Natural language expense recording via voice/text
- **AI Financial Coach**: Personalized financial advice using LGAI EXAONE 3.5 7.8B
- **Smart Budget Tracking**: Real-time spending analysis and predictions
- **Gamification**: Achievement system for savings goals
- **Data Visualization**: Charts, progress bars, and spending insights

### Target Users
- MZ Generation (25-39 years old)
- Monthly income 2-5 million KRW
- Users frustrated with complex finance apps
- Korean-speaking mobile-first users

## Tech Stack

### Frontend
- **React Native**: Cross-platform mobile development
- **NativeWind**: Tailwind CSS for React Native styling
- **TypeScript**: Type safety and better developer experience
- **Expo Router**: File-based navigation system
- **React Native Reanimated**: Smooth animations

### AI Integration
- **LGAI EXAONE 3.5 7.8B**: Korean-optimized conversational AI model
- **Hugging Face Transformers**: Model integration
- **Voice Recognition**: React Native Voice for speech input
- **Natural Language Processing**: Korean text analysis

### Backend & Data
- **Node.js/Express**: REST API server
- **PostgreSQL**: Primary database
- **Redis**: Caching and session management
- **JWT**: Authentication
- **AWS**: Cloud infrastructure

## Design System

### Color Palette
- **Primary**: Purple/Violet (#7C3AED)
- **Secondary**: Light Purple (#A855F7)
- **Background**: Clean White (#FFFFFF)
- **Text**: Dark Gray (#1F2937)
- **Success**: Green (#10B981)
- **Warning**: Orange (#F59E0B)
- **Error**: Red (#EF4444)

### UI Components
- **Cards**: Rounded corners (16px), subtle shadows
- **Buttons**: Circular for actions, rounded rectangles for primary
- **Progress Bars**: Gradient purple, 8px height
- **Typography**: Clean, readable fonts (Inter/System)
- **Icons**: Outlined style, consistent weight

### Layout Principles
- **Mobile-first**: Optimize for phone screens
- **Card-based**: Information in digestible cards
- **Minimal navigation**: Bottom tab bar only
- **Conversational UI**: Chat interface as primary interaction

## Project Structure

```
/
├── src/
│   ├── components/         # Reusable UI components
│   │   ├── ui/            # Basic UI elements (Button, Card, etc.)
│   │   ├── charts/        # Data visualization components
│   │   └── forms/         # Form components
│   ├── screens/           # Screen components
│   │   ├── chat/          # AI chat interface
│   │   ├── dashboard/     # Main dashboard
│   │   ├── analytics/     # Spending analytics
│   │   └── settings/      # User settings
│   ├── services/          # API and external services
│   │   ├── ai/            # EXAONE model integration
│   │   ├── api/           # REST API calls
│   │   └── storage/       # Local data storage
│   ├── utils/             # Helper functions
│   ├── types/             # TypeScript type definitions
│   └── constants/         # App constants
├── assets/                # Images, fonts, icons
├── docs/                  # Documentation
└── tests/                 # Test files
```

## Development Guidelines

### Code Style
- Use TypeScript for all new files
- Follow ESLint and Prettier configurations
- Use functional components with hooks
- Implement proper error boundaries
- Add JSDoc comments for complex functions

### State Management
- Use Zustand for global state
- Keep local state in components when possible
- Implement proper loading and error states
- Cache frequently used data

### Performance
- Implement React.memo for expensive components
- Use lazy loading for screens
- Optimize images and assets
- Implement proper list virtualization

### Security
- Encrypt sensitive financial data
- Implement proper authentication
- Validate all user inputs
- Follow GDPR compliance for data handling

## AI Integration Patterns

### EXAONE 3.5 Setup
```javascript
import { AutoModelForCausalLM, AutoTokenizer } from '@xenova/transformers';

const modelName = "LGAI-EXAONE/EXAONE-3.5-7.8B-Instruct";
const systemPrompt = "You are 천마비고, a helpful Korean financial assistant.";
```

### Conversation Flow
1. User input (voice/text)
2. Natural language processing
3. Intent recognition (expense, question, goal)
4. AI response generation
5. Action execution (save transaction, provide advice)

### Response Types
- **Transaction Recording**: "김치찌개 8천원 기록했어요"
- **Financial Advice**: "이번 주 카페비가 평소보다 40% 높아요"
- **Goal Tracking**: "저축 목표의 65% 달성했네요!"
- **Spending Insights**: "외식비를 20% 줄이면 월 12만원 절약 가능해요"

## Key Commands

### Setup
- `npm install` - Install dependencies
- `npx expo install` - Install Expo dependencies
- `npm run ios` - Run on iOS simulator
- `npm run android` - Run on Android emulator

### Development
- `npm run start` - Start development server
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript checks
- `npm run test` - Run tests
- `npm run build` - Build for production

### AI Model
- `npm run model:download` - Download EXAONE model
- `npm run model:test` - Test AI responses
- `npm run model:optimize` - Optimize model for mobile

## Testing Strategy

### Unit Tests
- Test utility functions
- Test AI response parsing
- Test data transformation
- Test component logic

### Integration Tests
- Test API interactions
- Test AI model integration
- Test navigation flows
- Test state management

### E2E Tests
- Test complete user journeys
- Test voice input workflows
- Test transaction recording
- Test goal achievement flows

## Deployment

### Build Process
1. Run tests and linting
2. Build production bundle
3. Optimize assets
4. Generate platform-specific builds

### Environment Variables
- `EXAONE_API_KEY`: AI model API key
- `DATABASE_URL`: Database connection
- `REDIS_URL`: Cache connection
- `JWT_SECRET`: Authentication secret

## Performance Targets

- **App Launch**: < 3 seconds
- **AI Response**: < 2 seconds
- **Screen Navigation**: < 500ms
- **Voice Recognition**: < 1 second
- **Data Sync**: < 5 seconds

## Localization

- Primary language: Korean
- Support for Korean financial terms
- Korean currency formatting (원)
- Korean date/time formats
- Cultural context for spending categories

## Accessibility

- Voice control support
- Screen reader compatibility
- High contrast mode
- Large text support
- Gesture-based navigation

Remember: This app aims to make financial management as easy as chatting with a friend. Prioritize simplicity and conversational UX over complex features. 천마비고 means 'Heavenly Demon's Secret Scroll' - a powerful AI that helps users master their finances like learning ancient martial arts.