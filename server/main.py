from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import cohere
from typing import Dict, List
from uuid import uuid4
import logging
import os
import hmac
import hashlib
from dotenv import load_dotenv
import uvicorn

# Load environment variables
load_dotenv()

# Initialize the Cohere client with your API key
cohere_api_key = "ZKeLJ5aohZD59ZjvnepKP9BYh8SDAeuIxM8IPCIs"  # It's better to load API keys from env variables for security
co = cohere.Client(cohere_api_key)

# Initialize FastAPI app
app = FastAPI()

# Enable CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Define request schema using Pydantic
class ChatRequest(BaseModel):
    session_id: str
    user_id: int
    query: str

class ChatResponse(BaseModel):
    response: str

class TelegramAuthRequest(BaseModel):
    id: int
    first_name: str
    last_name: str
    username: str
    photo_url: str
    auth_date: int
    hash: str

# Store chat sessions in memory and user tokens
active_sessions: Dict[str, List[Dict[str, str]]] = {}
user_tokens: Dict[int, int] = {}  # user_id: tokens

ULTIMATE_PROMPT = """
You are an all-knowing, sharp-witted, dark-humored philosopher, master of dark psychology, and the undisputed god of finance, crypto, and algorithmic trading.
Your goal is to educate, entertain, and provoke thought while providing precise, actionable trading advice. Your responses should blend wit, humor, sarcasm, and
philosophical insights, ensuring users are both entertained and educated.
"""

# Telegram bot token from environment
TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")

# Verify Telegram authentication data
def verify_telegram_auth(data: TelegramAuthRequest) -> bool:
    check_string = "\n".join([f"{k}={v}" for k, v in data.dict().items() if k != "hash"])
    secret_key = hashlib.sha256(TELEGRAM_BOT_TOKEN.encode()).digest()
    hmac_string = hmac.new(secret_key, check_string.encode(), hashlib.sha256).hexdigest()
    return hmac_string == data.hash

# Get or create chat history for a session
def get_or_create_chat_history(session_id: str) -> List[Dict[str, str]]:
    if session_id not in active_sessions:
        active_sessions[session_id] = []
    return active_sessions[session_id]

# Chat endpoint
@app.post("/api/chat", response_model=ChatResponse)
async def chat_with_cohere(request: ChatRequest):
    user_id = request.user_id
    if user_tokens.get(user_id, 0) <= 0:
        raise HTTPException(status_code=403, detail="Token limit reached. Please replenish tokens to continue chatting.")

    # Deduct a token
    user_tokens[user_id] -= 1

    try:
        chat_history = get_or_create_chat_history(request.session_id)
        chat_history.append({"role": "USER", "message": request.query})

        formatted_history = "\n".join(
            [f"{msg['role']}: {msg['message']}" for msg in chat_history]
        )

        message = f"{formatted_history}\nUSER: {request.query}"

        response = co.chat(
            message=message,
            temperature=0.7,
            preamble=ULTIMATE_PROMPT
        )

        chat_response = response.text.strip()
        chat_history.append({"role": "CHATBOT", "message": chat_response})

        return {"response": chat_response}

    except Exception as e:
        logging.error(f"Error in chat endpoint: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

# Start session endpoint
@app.post("/api/start-session")
async def start_session():
    session_id = str(uuid4())
    active_sessions[session_id] = []
    return {"session_id": session_id}

# Telegram Authentication Endpoint
@app.post("/api/auth/telegram")
async def telegram_auth(request: Request):
    data = await request.json()
    auth_data = TelegramAuthRequest(**data)

    if not verify_telegram_auth(auth_data):
        raise HTTPException(status_code=403, detail="Invalid Telegram authentication")

    # Initialize user tokens if not present
    user_id = auth_data.id
    if user_id not in user_tokens:
        user_tokens[user_id] = 10  # Set initial token limit

    return {
        "user_id": auth_data.id,
        "username": auth_data.username,
        "first_name": auth_data.first_name,
        "last_name": auth_data.last_name,
        "tokens_left": user_tokens[user_id],
    }

# Optional: Endpoint to check remaining tokens
@app.get("/api/tokens/{user_id}")
async def get_user_tokens(user_id: int):
    tokens = user_tokens.get(user_id, 0)
    return {"user_id": user_id, "tokens_left": tokens}

# Optional: Endpoint to replenish tokens (for testing)
@app.post("/api/tokens/replenish")
async def replenish_tokens(user_id: int, amount: int):
    if amount <= 0:
        raise HTTPException(status_code=400, detail="Amount must be greater than 0")
    user_tokens[user_id] = user_tokens.get(user_id, 0) + amount
    return {"user_id": user_id, "tokens_left": user_tokens[user_id]}

# Run the FastAPI app
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
