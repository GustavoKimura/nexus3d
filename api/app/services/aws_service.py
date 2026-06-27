import uuid
import os
import boto3


def upload_to_s3(file_content: bytes, filename: str) -> str:
    bucket_name = os.getenv("AWS_BUCKET_NAME", "nexus3d-scans")
    file_key = f"scans/{uuid.uuid4()}_{filename}"

    return f"https://{bucket_name}.s3.amazonaws.com/{file_key}"
