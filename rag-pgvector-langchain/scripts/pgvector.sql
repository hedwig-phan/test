-- Check version
SELECT version();

-- Create extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS vector;

--Drop table if exists invoice_info_vectors
DROP TABLE IF EXISTS invoice_info_vectors;

CREATE TABLE invoice_info_vectors (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id uuid,
    vector vector(768)
);

ALTER TABLE invoice_info_vectors 
ADD CONSTRAINT fk_invoice_info_vectors 
FOREIGN KEY (invoice_id) 
REFERENCES invoices(id);

--
ALTER TABLE invoices 
ADD COLUMN vector vector(1536);


