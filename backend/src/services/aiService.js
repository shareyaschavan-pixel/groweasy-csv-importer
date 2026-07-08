const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const BATCH_SIZE = 20;
const MAX_RETRIES = 3;

const SYSTEM_PROMPT = `You are a CRM data extraction AI for GrowEasy. Given raw CSV records as a JSON array, intelligently extract and map fields into GrowEasy CRM format.

OUTPUT FORMAT — return ONLY a valid JSON object, no markdown, no explanation:
{
  "imported": [ ...successfully mapped CRM records ],
  "skipped": [ ...records that could not be mapped with reason ]
}

CRM FIELDS TO EXTRACT:
- created_at: Lead creation date (must work with: new Date(created_at))
- name: Full name
- email: Primary email address
- country_code: Country dialing code e.g. +91
- mobile_without_country_code: Mobile without country code
- company: Company or organization
- city, state, country: Location fields
- lead_owner: Owner email or name
- crm_status: MUST be one of: GOOD_LEAD_FOLLOW_UP | DID_NOT_CONNECT | BAD_LEAD | SALE_DONE
- crm_note: Remarks, extra phones, extra emails, follow-up info
- data_source: MUST be one of: leads_on_demand | meridian_tower | eden_park | varah_swamy | sarjapur_plots (blank if none match)
- possession_time: Property possession time if present
- description: Extra description

RULES:
1. SKIP records with neither email nor mobile — add to skipped with reason
2. Multiple emails → use first, append rest to crm_note
3. Multiple mobiles → use first, append rest to crm_note
4. Map intelligently — column names may vary (e.g. "Phone" = mobile, "Lead Name" = name)
5. crm_status default: DID_NOT_CONNECT if unclear
6. Keep crm_note single-line (escape line breaks as \\n)
7. Skipped format: { original: {...}, reason: "..." }`;

/**
 * Extracts CRM records from raw CSV rows using Gemini AI
 * @param {Array<Object>} records
 * @returns {Promise<{imported, skipped, total_imported, total_skipped}>}
 */
async function extractCRMRecords(records) {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const allImported = [];
  const allSkipped = [];

  for (let i = 0; i < records.length; i += BATCH_SIZE) {
    const batch = records.slice(i, i + BATCH_SIZE);
    let result = null;
    let lastError = null;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        const prompt = `${SYSTEM_PROMPT}\n\nINPUT RECORDS:\n${JSON.stringify(batch, null, 2)}`;
        const response = await model.generateContent(prompt);
        const text = response.response.text().trim();
        // Strip markdown code fences if present
        const cleaned = text
          .replace(/^```json\s*/i, '')
          .replace(/^```\s*/i, '')
          .replace(/\s*```$/i, '');
        result = JSON.parse(cleaned);
        break;
      } catch (err) {
        lastError = err;
        console.error(`Batch ${Math.floor(i / BATCH_SIZE) + 1} attempt ${attempt} failed:`, err.message);
        if (attempt < MAX_RETRIES) {
          await new Promise((r) => setTimeout(r, 1000 * attempt));
        }
      }
    }

    if (result) {
      allImported.push(...(result.imported || []));
      allSkipped.push(...(result.skipped || []));
    } else {
      allSkipped.push(
        ...batch.map((record) => ({
          original: record,
          reason: `AI processing failed after ${MAX_RETRIES} attempts: ${lastError?.message}`,
        }))
      );
    }
  }

  return {
    imported: allImported,
    skipped: allSkipped,
    total_imported: allImported.length,
    total_skipped: allSkipped.length,
  };
}

module.exports = { extractCRMRecords };
