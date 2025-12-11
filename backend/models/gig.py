from pydantic import BaseModel, Field
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


class Gig(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    professor_id: str
    title: str
    description: str
    area_of_study: str
    technologies: Optional[str] = None
    target_type: Optional[str] = None
    paper_type: Optional[str] = None
    timeline: Optional[str] = None
    year_requirement: Optional[str] = None
    cgpa_requirement: Optional[str] = None
    funded: bool = False
    candidate_count: Optional[int] = None
    status: str = "open"
    publication_link: Optional[str] = None
    publication_venue: Optional[str] = None
    paused_reason: Optional[str] = None

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}
