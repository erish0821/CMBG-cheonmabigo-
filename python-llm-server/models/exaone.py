import torch
import logging
from transformers import AutoModelForCausalLM, AutoTokenizer
from typing import Dict, Any, Optional
import os

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ExaoneModel:
    """LGAI-EXAONE 3.5 7.8B 모델 핸들러"""

    def __init__(self, model_name: str = "LGAI-EXAONE/EXAONE-3.5-7.8B-Instruct"):
        self.model_name = model_name
        self.model = None
        self.tokenizer = None
        self.device = "cuda" if torch.cuda.is_available() else "cpu"

        logger.info(f"EXAONE 모델 초기화 시작: {model_name}")
        logger.info(f"사용 장치: {self.device}")
        if torch.cuda.is_available():
            logger.info(f"CUDA 장치 수: {torch.cuda.device_count()}")
            for i in range(torch.cuda.device_count()):
                logger.info(f"GPU {i}: {torch.cuda.get_device_name(i)}")

    def load_model(self) -> bool:
        """모델과 토크나이저 로드"""
        try:
            logger.info("토크나이저 로드 중...")
            self.tokenizer = AutoTokenizer.from_pretrained(
                self.model_name,
                trust_remote_code=True
            )

            logger.info("모델 로드 중...")
            self.model = AutoModelForCausalLM.from_pretrained(
                self.model_name,
                torch_dtype=torch.bfloat16,
                trust_remote_code=True,
                device_map="auto"
            )

            logger.info("EXAONE 모델 로드 완료")
            return True

        except Exception as e:
            logger.error(f"모델 로드 실패: {str(e)}")
            return False

    def generate_response(
        self,
        user_message: str,
        system_message: str = "You are EXAONE model from LG AI Research, a helpful assistant.",
        max_new_tokens: int = 256,
        temperature: float = 0.7,
        do_sample: bool = True
    ) -> str:
        """응답 생성"""
        try:
            if not self.model or not self.tokenizer:
                raise ValueError("모델이 로드되지 않았습니다.")

            # 메시지 포맷팅 (EXAONE 공식 형식)
            messages = [
                {"role": "system", "content": system_message},
                {"role": "user", "content": user_message}
            ]

            # 채팅 템플릿 적용
            input_ids = self.tokenizer.apply_chat_template(
                messages,
                tokenize=True,
                add_generation_prompt=True,
                return_tensors="pt"
            )

            # GPU로 이동
            input_ids = input_ids.to(self.device)

            # 생성
            with torch.no_grad():
                output = self.model.generate(
                    input_ids,
                    eos_token_id=self.tokenizer.eos_token_id,
                    max_new_tokens=max_new_tokens,
                    temperature=temperature,
                    do_sample=do_sample,
                    pad_token_id=self.tokenizer.eos_token_id
                )

            # 디코딩
            full_response = self.tokenizer.decode(output[0], skip_special_tokens=True)

            # 원본 프롬프트 제거하여 응답만 추출
            prompt_text = self.tokenizer.decode(input_ids[0], skip_special_tokens=True)
            response = full_response[len(prompt_text):].strip()

            return response

        except Exception as e:
            logger.error(f"응답 생성 실패: {str(e)}")
            return f"죄송합니다. 응답 생성 중 오류가 발생했습니다: {str(e)}"

    def generate_chat_response(self, message: str) -> str:
        """천마비고 AI 코치로서 채팅 응답 생성"""
        system_prompt = """당신은 천마비고, 한국의 친근한 AI 재정 코치입니다.
사용자의 재정 관리를 도와주는 것이 주요 역할입니다.
- 친근하고 격려적인 말투로 대화해주세요
- 한국의 금융 상황과 문화를 이해하고 있습니다
- 구체적이고 실용적인 조언을 제공해주세요
- 사용자의 소비 패턴을 분석하고 개선점을 제안해주세요"""

        return self.generate_response(
            user_message=message,
            system_message=system_prompt,
            max_new_tokens=256,
            temperature=0.7
        )

    def parse_transaction(self, text: str) -> Dict[str, Any]:
        """자연어 거래 내용 파싱"""
        system_prompt = """당신은 한국어 자연어 거래 내용을 분석하는 전문가입니다.
사용자의 입력에서 다음 정보를 추출해주세요:
- amount: 금액 (숫자만, 단위 제외)
- description: 거래 내용
- category: 카테고리 (식비, 교통비, 쇼핑, 문화생활, 의료비, 교육비, 기타 중 하나)
- payment_method: 결제 수단 (카드, 현금, 계좌이체 중 하나, 명시되지 않으면 '카드')

JSON 형태로만 응답해주세요. 예시:
{"amount": 8000, "description": "김치찌개", "category": "식비", "payment_method": "카드"}"""

        response = self.generate_response(
            user_message=text,
            system_message=system_prompt,
            max_new_tokens=128,
            temperature=0.3,
            do_sample=True
        )

        try:
            import json
            # JSON 부분만 추출
            start = response.find('{')
            end = response.rfind('}') + 1
            if start != -1 and end != 0:
                json_str = response[start:end]
                return json.loads(json_str)
            else:
                raise ValueError("JSON 형식을 찾을 수 없습니다")
        except Exception as e:
            logger.error(f"거래 파싱 실패: {str(e)}")
            return {
                "amount": 0,
                "description": text,
                "category": "기타",
                "payment_method": "카드"
            }

    def get_health_status(self) -> Dict[str, Any]:
        """모델 상태 확인"""
        return {
            "model_loaded": self.model is not None,
            "tokenizer_loaded": self.tokenizer is not None,
            "device": self.device,
            "cuda_available": torch.cuda.is_available(),
            "cuda_devices": torch.cuda.device_count() if torch.cuda.is_available() else 0,
            "model_name": self.model_name
        }

# 전역 모델 인스턴스
_model_instance: Optional[ExaoneModel] = None

def get_model() -> ExaoneModel:
    """싱글톤 모델 인스턴스 반환"""
    global _model_instance
    if _model_instance is None:
        _model_instance = ExaoneModel()
        if not _model_instance.load_model():
            raise RuntimeError("EXAONE 모델 로드 실패")
    return _model_instance