from pydantic import BaseModel, EmailStr


class OtpVerifyRequest(BaseModel):
    email: EmailStr
    otp: str


class OtpSendResponse(BaseModel):
    message: str
    expires_in_seconds: int
