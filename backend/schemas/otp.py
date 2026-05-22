from pydantic import BaseModel, EmailStr


class OtpRequestRequest(BaseModel):
    """Request to send OTP to an email"""
    email: EmailStr


class OtpVerifyRequest(BaseModel):
    email: EmailStr
    otp: str


class OtpSendResponse(BaseModel):
    message: str
    expires_in_seconds: int
