from pydantic import BaseModel
from typing import Optional


class GigBase(BaseModel):
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


class GigCreate(GigBase):
    professor_id: str


class GigUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    area_of_study: Optional[str] = None
    technologies: Optional[str] = None
    target_type: Optional[str] = None
    paper_type: Optional[str] = None
    timeline: Optional[str] = None
    year_requirement: Optional[str] = None
    cgpa_requirement: Optional[str] = None
    funded: Optional[bool] = None
    candidate_count: Optional[int] = None


class GigClose(BaseModel):
    publication_link: Optional[str] = None
    publication_venue: Optional[str] = None


class GigHold(BaseModel):
    paused_reason: str


class GigResponse(GigBase):
    id: str
    professor_id: str
    status: str
    publication_link: Optional[str] = None
    publication_venue: Optional[str] = None
    paused_reason: Optional[str] = None

    class Config:
        from_attributes = True
