-- Imagen del vino asociada al lote.
-- En local se guarda como data URL base64; a futuro puede migrarse a S3/MinIO guardando solo la URL pública.
ALTER TABLE lots ADD COLUMN IF NOT EXISTS image_url TEXT;
