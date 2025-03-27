import { PgVectorDatabase } from "../core/db";
import { LLMService } from "../core/llm";


class StoringVectorService {
    private db: PgVectorDatabase;
    private llmService: LLMService;

    constructor(db: PgVectorDatabase, llmService: LLMService) {
        this.db = db;
        this.llmService = llmService;
    }
    
    //Store invoice to vector by invoice id
    async storeInvoiceToVector(invoiceId: string) {
        //Get invoice from db
        const invoices = await this.db.getClient().query(`SELECT 
            "invoiceDate", 
            "invoiceNo", 
            "invoiceName",
            "serviceFromDate",
            "serviceToDate",
            "description",
            "internalNote",
            "status",
            "currency",
            "billableManMonth",
            "rateCard",
            "totalAmount",
            "discount",
            "invoiceAmount",
            "serviceProvider",
            "buyerName",
            "billingEmailAddress",
            "billingAttention",
            "purchaseOrder",
            "paymentTerm",
            "paymentTermType",
            "dueDate",
            "paidAmount",
            "paidDate",
            "remainAmount",
            "createdAt",
            "updatedAt" FROM invoices WHERE id = $1`, [invoiceId]);
        if (invoices.rows.length === 0) {
            throw new Error(`Invoice with ID ${invoiceId} not found.`);
        }
        const invoice = invoices.rows[0];
        const invoiceString = JSON.stringify(invoice);
       
        //Get vector from llm
        const vector = await this.llmService.convertStringToVector(invoiceString);
        
        const vectorString = JSON.stringify(vector);
   
        const query = `
            INSERT INTO invoice_info_vectors (invoice_id, vector)
            VALUES ($1, $2)
        `;
        await this.db.getClient().query(query, [invoiceId, vectorString]);
    }

    //Store user to vector all invoice
    async storeInvoicesToVector() {
        //Get invoice from db
        const invoices = await this.db.getClient().query(`SELECT
            id,
            "invoiceDate", 
            "invoiceNo", 
            "invoiceName",
            "serviceFromDate",
            "serviceToDate",
            "description",
            "internalNote",
            "status",
            "currency",
            "billableManMonth",
            "rateCard",
            "totalAmount",
            "discount",
            "invoiceAmount",
            "serviceProvider",
            "buyerName",
            "billingEmailAddress",
            "billingAttention",
            "purchaseOrder",
            "paymentTerm",
            "paymentTermType",
            "dueDate",
            "paidAmount",
            "paidDate",
            "remainAmount",
            "createdAt",
            "updatedAt" FROM invoices`);
        if (invoices.rows.length === 0) {
            throw new Error(`Invoice not found.`);
        }

        invoices.rows.forEach(async (invoice) => {
            const invoiceString = JSON.stringify(invoice);
       
            //Get vector from llm
            const vector = await this.llmService.convertStringToVector(invoiceString);
            
            const vectorString = JSON.stringify(vector);
       
            const query = `
                INSERT INTO invoice_info_vectors (invoice_id, vector)
                VALUES ($1, $2)
            `;
            await this.db.getClient().query(query, [invoice.id, vectorString]);
        });
        return "Success";
    }
}

export { StoringVectorService };