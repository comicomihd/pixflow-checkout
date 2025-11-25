-- Add price column to presells table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'presells' AND column_name = 'price'
  ) THEN
    ALTER TABLE public.presells
    ADD COLUMN price DECIMAL(10,2) DEFAULT NULL;
    
    -- Add comment to explain the column
    COMMENT ON COLUMN public.presells.price IS 'Optional price for the presell product';
  END IF;
END $$;
