from pydantic import BaseModel, EmailStr, Field
from typing import Optional
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


class Professor(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    name: str
    department: str
    email: EmailStr
    hashed_password: str
    college_name: Optional[str] = None
    qualification: str
    research_areas: Optional[str] = None
    experience_years: Optional[int] = None
    previous_publications: Optional[str] = None

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}
