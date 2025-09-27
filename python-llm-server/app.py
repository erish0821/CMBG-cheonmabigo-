import asyncio
import logging
import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any, Optional
import os

from models.exaone import get_model

# 로깅 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# FastAPI 앱 생성
app = FastAPI(
    title="천마비고 LLM Server",
    description="LGAI-EXAONE 3.5 7.8B 기반 AI 재정 코치 서버",
    version="1.0.0"
)

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 개발용, 프로덕션에서는 특정 도메인만 허용
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request/Response 모델
class ChatRequest(BaseModel):
    message: str
    system_message: Optional[str] = None
    max_tokens: Optional[int] = 256
    temperature: Optional[float] = 0.7

class ChatResponse(BaseModel):
    response: str
    status: str = "success"

class TransactionRequest(BaseModel):
    text: str

class TransactionResponse(BaseModel):
    amount: float
    description: str
    category: str
    payment_method: str
    status: str = "success"

class HealthResponse(BaseModel):
    status: str
    model_info: Dict[str, Any]

# 전역 변수
model = None

@app.on_event("startup")
async def startup_event():
    """서버 시작 시 모델 로드"""
    global model
    try:
        logger.info("EXAONE 모델 로드 시작...")
        model = get_model()
        logger.info("EXAONE 모델 로드 완료")
    except Exception as e:
        logger.error(f"모델 로드 실패: {str(e)}")
        # 모델 로드에 실패해도 서버는 시작되도록 함
        model = None

@app.get("/health", response_model=HealthResponse)
async def health_check():
    """헬스 체크 엔드포인트"""
    try:
        if model:
            model_info = model.get_health_status()
            status = "healthy" if model_info["model_loaded"] else "model_not_loaded"
        else:
            model_info = {"error": "Model not initialized"}
            status = "model_not_loaded"

        return HealthResponse(status=status, model_info=model_info)
    except Exception as e:
        logger.error(f"Health check 실패: {str(e)}")
        return HealthResponse(
            status="error",
            model_info={"error": str(e)}
        )

@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """채팅 엔드포인트"""
    try:
        if not model:
            raise HTTPException(status_code=503, detail="모델이 로드되지 않았습니다")

        logger.info(f"채팅 요청: {request.message[:100]}...")

        if request.system_message:
            response = model.generate_response(
                user_message=request.message,
                system_message=request.system_message,
                max_new_tokens=request.max_tokens,
                temperature=request.temperature
            )
        else:
            response = model.generate_chat_response(request.message)

        logger.info(f"채팅 응답 생성 완료: {len(response)}자")

        return ChatResponse(response=response)

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"채팅 처리 실패: {str(e)}")
        raise HTTPException(status_code=500, detail=f"채팅 처리 중 오류 발생: {str(e)}")

@app.post("/transaction/parse", response_model=TransactionResponse)
async def parse_transaction(request: TransactionRequest):
    """거래 내용 파싱 엔드포인트"""
    try:
        if not model:
            raise HTTPException(status_code=503, detail="모델이 로드되지 않았습니다")

        logger.info(f"거래 파싱 요청: {request.text}")

        parsed_data = model.parse_transaction(request.text)

        logger.info(f"거래 파싱 완료: {parsed_data}")

        return TransactionResponse(
            amount=parsed_data["amount"],
            description=parsed_data["description"],
            category=parsed_data["category"],
            payment_method=parsed_data["payment_method"]
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"거래 파싱 실패: {str(e)}")
        raise HTTPException(status_code=500, detail=f"거래 파싱 중 오류 발생: {str(e)}")

@app.get("/model/info")
async def get_model_info():
    """모델 정보 조회"""
    try:
        if not model:
            return {"error": "Model not loaded"}

        return model.get_health_status()

    except Exception as e:
        logger.error(f"모델 정보 조회 실패: {str(e)}")
        return {"error": str(e)}

# 루트 엔드포인트
@app.get("/")
async def root():
    """루트 엔드포인트"""
    return {
        "message": "천마비고 LLM Server",
        "version": "1.0.0",
        "description": "LGAI-EXAONE 3.5 7.8B 기반 AI 재정 코치 서버",
        "endpoints": {
            "health": "/health",
            "chat": "/chat",
            "transaction_parse": "/transaction/parse",
            "model_info": "/model/info"
        }
    }

if __name__ == "__main__":
    # 환경 변수에서 포트 설정 (기본값: 8001)
    port = int(os.getenv("PORT", 8001))
    host = os.getenv("HOST", "0.0.0.0")

    logger.info(f"천마비고 LLM 서버 시작: {host}:{port}")

    uvicorn.run(
        "app:app",
        host=host,
        port=port,
        reload=True,
        log_level="info"
    )