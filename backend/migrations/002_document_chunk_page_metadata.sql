ALTER TABLE public.document_chunks
    ADD COLUMN IF NOT EXISTS page_number integer;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'document_chunks_page_number_positive'
          AND conrelid = 'public.document_chunks'::regclass
    ) THEN
        ALTER TABLE public.document_chunks
            ADD CONSTRAINT document_chunks_page_number_positive
            CHECK (page_number IS NULL OR page_number > 0);
    END IF;
END;
$$;

CREATE INDEX IF NOT EXISTS idx_document_chunks_document_index
    ON public.document_chunks (document_id, chunk_index);
