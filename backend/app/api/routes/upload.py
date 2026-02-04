import shutil
import os
from fastapi import APIRouter, UploadFile, File, HTTPException
from datetime import datetime

router = APIRouter(tags=["File Upload"])

# Upload klasörünü tanımla
UPLOAD_DIR = "uploads"
if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR)

@router.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    try:
        # Dosya adına zaman damgası ekle (Çakışmayı önlemek için)
        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
        filename = f"{timestamp}_{file.filename}"
        file_location = f"{UPLOAD_DIR}/{filename}"
        
        # Dosyayı sunucuya kaydet
        with open(file_location, "wb+") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        # Erişim linkini döndür (Backend URL'i + dosya yolu)
        # Not: Frontend bu linki alıp veritabanına kaydedecek
        return {
            "url": f"http://127.0.0.1:8000/uploads/{filename}",
            "filename": filename
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"File upload failed: {str(e)}")