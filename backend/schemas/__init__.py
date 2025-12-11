# Import all schemas here for easy access
from .professor import ProfessorCreate, ProfessorUpdate, ProfessorResponse
from .gig import GigCreate, GigUpdate, GigClose, GigHold, GigResponse

__all__ = [
    "ProfessorCreate",
    "ProfessorUpdate",
    "ProfessorResponse",
    "GigCreate",
    "GigUpdate",
    "GigClose",
    "GigHold",
    "GigResponse",
]
