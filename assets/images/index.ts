/**
 * 이미지 에셋 관리
 */

export const IMAGES = {
  sogyo: require('./sogyo.png'),
} as const;

export type ImageKey = keyof typeof IMAGES;