from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from bson import ObjectId


class PyObjectId(ObjectId):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid ObjectId")
        return ObjectId(v)

    @classmethod
    def __get_pydantic_json_schema__(cls, schema):
        schema.update(type="string")
        return schema


class Application(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    gig_id: str
    student_name: str
    student_email: str
    student_year: Optional[str] = None
    student_cgpa: Optional[str] = None
    resume_link: str
    cover_letter: Optional[str] = None
    status: str = "pending"
    applied_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str, datetime: lambda v: v.isoformat()}
