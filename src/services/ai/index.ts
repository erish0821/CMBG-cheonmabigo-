// AI 서비스 메인 엔트리 포인트

export { ExaoneService, exaoneService } from './ExaoneService';
export { PromptManager } from './PromptManager';
export { ResponseParser } from './ResponseParser';
export { IntentClassifier } from './IntentClassifier';
export { AIOptimizer } from './AIOptimizer';

// 편의를 위한 통합 AI 서비스 클래스
export { CheonmaBigoAI } from './CheonmaBigoAI';

// 기본 설정
export const DEFAULT_AI_CONFIG = {
  modelName: 'LGAI-EXAONE/EXAONE-3.5-7.8B-Instruct',
  maxTokens: 2048,
  temperature: 0.7,
  contextWindow: 4096,
  enableCaching: true,
  enableOptimization: true,
};

// 모듈 버전
export const AI_MODULE_VERSION = '1.0.0';
