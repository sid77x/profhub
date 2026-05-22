import hashlib
import secrets


def generate_otp(length: int = 5) -> str:
    min_value = 10 ** (length - 1)
    max_value = (10 ** length) - 1
    return str(secrets.randbelow(max_value - min_value + 1) + min_value)


def hash_otp(otp: str) -> str:
    return hashlib.sha256(otp.encode("utf-8")).hexdigest()
