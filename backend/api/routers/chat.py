from datetime import datetime
from typing import Set

from bson import ObjectId
from pymongo.errors import DuplicateKeyError
from fastapi import APIRouter, HTTPException, Query, WebSocket, WebSocketDisconnect, status
from fastapi.encoders import jsonable_encoder

from core.database import applications_collection, database, gigs_collection, professors_collection, students_collection
from schemas.chat import ChatConversationResponse, ChatMessageCreate, ChatMessageResponse

router = APIRouter()


class ConnectionManager:
    def __init__(self):
        self.active_connections: dict[str, Set[WebSocket]] = {}

    async def connect(self, conversation_id: str, websocket: WebSocket):
        await websocket.accept()
        if conversation_id not in self.active_connections:
            self.active_connections[conversation_id] = set()
        self.active_connections[conversation_id].add(websocket)

    def disconnect(self, conversation_id: str, websocket: WebSocket):
        if conversation_id in self.active_connections:
            self.active_connections[conversation_id].discard(websocket)
            if not self.active_connections[conversation_id]:
                del self.active_connections[conversation_id]

    async def broadcast(self, conversation_id: str, message: dict):
        if conversation_id not in self.active_connections:
            return

        payload = jsonable_encoder(message)
        disconnected = set()
        for connection in self.active_connections[conversation_id]:
            try:
                await connection.send_json(payload)
            except Exception:
                disconnected.add(connection)

        for connection in disconnected:
            self.disconnect(conversation_id, connection)


manager = ConnectionManager()

conversations_collection = database.get_collection("chat_conversations")
messages_collection = database.get_collection("chat_messages")


def _conversation_key(gig_id: str, professor_id: str, student_id: str) -> str:
    return f"{gig_id}:{professor_id}:{student_id}"


def _id_query_values(value: str) -> list[str]:
    values = [str(value)]
    if ObjectId.is_valid(value):
        values.append(str(ObjectId(value)))
    return list(dict.fromkeys(values))


def _conversation_to_response(conversation: dict, user_id: str) -> dict:
    professor_id = str(conversation.get("professor_id", ""))
    student_id = str(conversation.get("student_id", ""))
    user_id = str(user_id)
    other_participant_type = "student" if professor_id == user_id else "professor"
    other_participant_id = student_id if other_participant_type == "student" else professor_id
    other_participant_name = (
        conversation.get("student_name") or "Student"
        if other_participant_type == "student"
        else conversation.get("professor_name") or "Professor"
    )

    return {
        "id": str(conversation["_id"]),
        "conversation_key": conversation.get("conversation_key", ""),
        "gig_id": conversation.get("gig_id", ""),
        "gig_title": conversation.get("gig_title", "Gig Chat"),
        "professor_id": conversation.get("professor_id", ""),
        "professor_name": conversation.get("professor_name") or "Professor",
        "student_id": conversation.get("student_id", ""),
        "student_name": conversation.get("student_name") or "Student",
        "application_id": conversation.get("application_id", ""),
        "unlocked": True,
        "last_message": conversation.get("last_message"),
        "last_message_at": conversation.get("last_message_at"),
        "created_at": conversation.get("created_at", datetime.utcnow()),
        "other_participant_id": other_participant_id,
        "other_participant_name": other_participant_name,
        "other_participant_type": other_participant_type,
    }


def _message_to_response(message: dict) -> dict:
    return {
        "id": str(message["_id"]),
        "conversation_id": message.get("conversation_id", ""),
        "sender_id": message.get("sender_id", ""),
        "sender_type": message.get("sender_type", "student"),
        "sender_name": message.get("sender_name", ""),
        "message": message.get("message", ""),
        "created_at": message.get("created_at", datetime.utcnow()),
    }


async def _load_user_name(user_type: str, user_id: str) -> str:
    if not ObjectId.is_valid(user_id):
        return "Professor" if user_type == "professor" else "Student"

    if user_type == "professor":
        doc = await professors_collection.find_one({"$or": [{"_id": ObjectId(user_id)}, {"_id": user_id}]})
        return doc.get("name", "Professor") if doc else "Professor"

    doc = await students_collection.find_one({"$or": [{"_id": ObjectId(user_id)}, {"_id": user_id}]})
    return doc.get("name", "Student") if doc else "Student"


async def ensure_chat_conversation_for_application(application_id: str) -> dict | None:
    application = await applications_collection.find_one({"_id": ObjectId(application_id)}) if ObjectId.is_valid(application_id) else None
    if not application or application.get("status") != "accepted":
        return None

    gig = await gigs_collection.find_one({"_id": ObjectId(application["gig_id"])}) if ObjectId.is_valid(application.get("gig_id", "")) else None
    if not gig or not application.get("student_id") or not gig.get("professor_id"):
        return None

    gig_id = str(application["gig_id"])
    professor_id = str(gig["professor_id"])
    student_id = str(application["student_id"])
    key = _conversation_key(gig_id, professor_id, student_id)

    existing = await conversations_collection.find_one({"conversation_key": key})
    if existing:
        return existing

    professor_name = await _load_user_name("professor", professor_id)
    student_name = await _load_user_name("student", student_id)

    conversation = {
        "conversation_key": key,
        "gig_id": gig_id,
        "gig_title": gig.get("title", "Gig Chat"),
        "professor_id": professor_id,
        "professor_name": professor_name,
        "student_id": student_id,
        "student_name": student_name,
        "application_id": str(application_id),
        "unlocked": True,
        "last_message": "Chat unlocked",
        "last_message_at": datetime.utcnow(),
        "created_at": datetime.utcnow(),
    }

    try:
        result = await conversations_collection.insert_one(conversation)
    except DuplicateKeyError:
        return await conversations_collection.find_one({"conversation_key": key})

    return await conversations_collection.find_one({"_id": result.inserted_id})


@router.get("/chats/{user_type}/{user_id}", response_model=list[ChatConversationResponse])
async def list_user_chats(user_type: str, user_id: str):
    if user_type not in ["professor", "student"]:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid user type")

    query_field = "student_id" if user_type == "student" else "professor_id"
    query = {"$or": [{query_field: value} for value in _id_query_values(user_id)]}
    conversations = []
    async for conversation in conversations_collection.find(query).sort("last_message_at", -1):
        try:
            conversations.append(_conversation_to_response(conversation, user_id))
        except Exception:
            continue
    return conversations


@router.get("/chat-conversations/{conversation_id}", response_model=ChatConversationResponse)
async def get_chat_conversation(conversation_id: str, user_id: str):
    if not ObjectId.is_valid(conversation_id):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid conversation ID")

    conversation = await conversations_collection.find_one({"_id": ObjectId(conversation_id)})
    if not conversation:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Conversation not found")

    if user_id not in [conversation.get("student_id"), conversation.get("professor_id")]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You do not have access to this chat")

    return _conversation_to_response(conversation, user_id)


@router.get("/chat-conversations/{conversation_id}/messages", response_model=list[ChatMessageResponse])
async def get_chat_messages(conversation_id: str, user_id: str):
    if not ObjectId.is_valid(conversation_id):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid conversation ID")

    conversation = await conversations_collection.find_one({"_id": ObjectId(conversation_id)})
    if not conversation:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Conversation not found")

    if user_id not in [conversation.get("student_id"), conversation.get("professor_id")]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You do not have access to this chat")

    messages = []
    async for message in messages_collection.find({"conversation_id": conversation_id}).sort("created_at", 1):
        messages.append(_message_to_response(message))
    return messages


async def _get_conversation_for_user(conversation_id: str, user_id: str) -> dict:
    if not ObjectId.is_valid(conversation_id):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid conversation ID")

    conversation = await conversations_collection.find_one({"_id": ObjectId(conversation_id)})
    if not conversation:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Conversation not found")

    participant_ids = {str(conversation.get("student_id")), str(conversation.get("professor_id"))}
    if str(user_id) not in participant_ids:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You do not have access to this chat")

    return conversation


async def _create_chat_message(
    conversation_id: str,
    conversation: dict,
    sender_id: str,
    sender_type: str,
    message_text: str,
) -> dict:
    participant_ids = {str(conversation.get("student_id")), str(conversation.get("professor_id"))}
    if str(sender_id) not in participant_ids:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You do not have access to this chat")

    if sender_type not in ["professor", "student"]:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid sender type")

    cleaned_message = message_text.strip()
    if not cleaned_message:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Message cannot be empty")

    sender_name = await _load_user_name(sender_type, sender_id)
    message_doc = {
        "conversation_id": conversation_id,
        "sender_id": sender_id,
        "sender_type": sender_type,
        "sender_name": sender_name,
        "message": cleaned_message,
        "created_at": datetime.utcnow(),
    }

    result = await messages_collection.insert_one(message_doc)
    await conversations_collection.update_one(
        {"_id": ObjectId(conversation_id)},
        {
            "$set": {
                "last_message": cleaned_message,
                "last_message_at": message_doc["created_at"],
            }
        },
    )

    created_message = await messages_collection.find_one({"_id": result.inserted_id})
    message_response = _message_to_response(created_message)
    await manager.broadcast(conversation_id, {"type": "message", "data": message_response})
    return message_response


@router.post("/chat-conversations/{conversation_id}/messages", response_model=ChatMessageResponse, status_code=status.HTTP_201_CREATED)
async def send_chat_message(conversation_id: str, payload: ChatMessageCreate):
    conversation = await _get_conversation_for_user(conversation_id, payload.sender_id)
    return await _create_chat_message(
        conversation_id,
        conversation,
        payload.sender_id,
        payload.sender_type,
        payload.message,
    )


async def websocket_chat(websocket: WebSocket, conversation_id: str, user_id: str = Query(...)):
    await websocket.accept()

    try:
        conversation = await _get_conversation_for_user(conversation_id, user_id)
    except HTTPException as exc:
        reason = exc.detail if isinstance(exc.detail, str) else "Access denied"
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION, reason=reason)
        return

    if conversation_id not in manager.active_connections:
        manager.active_connections[conversation_id] = set()
    manager.active_connections[conversation_id].add(websocket)

    try:
        while True:
            data = await websocket.receive_json()
            sender_id = data.get("sender_id", "")
            sender_type = data.get("sender_type", "")
            message_text = data.get("message", "")

            if str(sender_id) != str(user_id):
                await websocket.send_json({"type": "error", "detail": "sender_id does not match authenticated user"})
                continue

            try:
                await _create_chat_message(conversation_id, conversation, str(sender_id), sender_type, message_text)
            except HTTPException as exc:
                detail = exc.detail if isinstance(exc.detail, str) else "Failed to send message"
                await websocket.send_json({"type": "error", "detail": detail})
    except WebSocketDisconnect:
        manager.disconnect(conversation_id, websocket)
