import os
import uuid
from google.cloud import storage
from server import config
from functools import lru_cache

@lru_cache
def get_settings():
    return config.Settings()
Settings = get_settings()

# './server/credentials.json'
os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = Settings.GOOGLE_APPLICATION_CREDENTIALS

# Uploads a file to the bucket
def upload_file(source_filename):
    storage_client = storage.Client()
    bucket = storage_client.bucket("gdg-assist")

    file_name = os.path.basename(source_filename)
    # Create unique filename
    destination_filename = f"{uuid.uuid4().hex[:8]}_{file_name}"
    blob = bucket.blob(destination_filename)

    # Optional: set a generation-match precondition to avoid race conditions
    generation_match_precondition = 0
    blob.upload_from_filename(source_filename,if_generation_match=generation_match_precondition)

    blob.make_public()
    file_url = blob.public_url

    return file_url

# print(upload_file("./server/public/SOFTWARE22BCE10461.pdf"))

# delete file from the bucket
def delete_file(file_url):
    """Deletes a file from the bucket."""

    # Name of the file to delete
    blob_name = file_url.split("/")[-1]

    # Initialize a storage client
    storage_client = storage.Client()

    bucket = storage_client.bucket("gdg-assist")
    blob = bucket.blob(blob_name)
    generation_match_precondition = None

    # Optional: set a generation-match precondition to avoid potential race conditions
    # and data corruptions. The request to delete is aborted if the object's
    # generation number does not match your precondition.
    blob.reload()  # Fetch blob metadata to use in generation_match_precondition.
    generation_match_precondition = blob.generation

    blob.delete(if_generation_match=generation_match_precondition)

    return f"File {blob_name} deleted." 

# delete_file("https://storage.googleapis.com/gdg-assist/b9f8e074_SOFTWARE22BCE10461.pdf")