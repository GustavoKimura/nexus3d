import uuid
import io
from minio import Minio


def upload_to_s3(file_content: bytes, filename: str) -> str:
    client = Minio(
        "minio:9000", access_key="minioadmin", secret_key="minioadmin", secure=False
    )

    bucket_name = "point-clouds"

    if not client.bucket_exists(bucket_name):
        client.make_bucket(bucket_name)

    file_key = f"scans/{uuid.uuid4()}_{filename}"
    file_stream = io.BytesIO(file_content)

    client.put_object(bucket_name, file_key, data=file_stream, length=len(file_content))

    return f"http://localhost:9000/{bucket_name}/{file_key}"
