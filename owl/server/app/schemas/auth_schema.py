from pydantic import BaseModel, EmailStr


class LoginInputSchema(BaseModel):
    email: EmailStr
    password: str


class LoginOutputSchema(BaseModel):
    email: EmailStr
    name: str
    access_token: str
