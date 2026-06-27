import uuid
import io
import json
import os
from minio import Minio


def upload_to_s3(file_content: bytes, filename: str) -> str:
    minio_endpoint = os.getenv("MINIO_ENDPOINT", "minio:9000")
    minio_access = os.getenv("MINIO_ROOT_USER", "minioadmin")
    minio_secret = os.getenv("MINIO_ROOT_PASSWORD", "minioadmin")
    public_url_base = os.getenv("MINIO_PUBLIC_URL", "http://localhost:9000")

    client = Minio(
        minio_endpoint, access_key=minio_access, secret_key=minio_secret, secure=False
    )

    bucket_name = "point-clouds"

    if not client.bucket_exists(bucket_name):
        client.make_bucket(bucket_name)

    policy = {
        "Version": "2012-10-17",
        "Statement": [
            {
                "Effect": "Allow",
                "Principal": "*",
                "Action": ["s3:GetObject"],
                "Resource": [f"arn:aws:s3:::{bucket_name}/*"],
            }
        ],
    }
    client.set_bucket_policy(bucket_name, json.dumps(policy))

    file_key = f"scans/{uuid.uuid4()}_{filename}"
    file_stream = io.BytesIO(file_content)

    client.put_object(
        bucket_name,
        file_key,
        data=file_stream,
        length=len(file_content),
        content_type="text/plain",
    )

    return f"{public_url_base}/{bucket_name}/{file_key}"
