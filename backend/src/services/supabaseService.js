const { createClient } = require('@supabase/supabase-js');

let supabase = null;

function getSupabaseClient() {
  if (!supabase) {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_KEY;
    if (!url || !key) {
      console.warn('[Supabase] SUPABASE_URL or SUPABASE_SERVICE_KEY not set — persistence disabled.');
      return null;
    }
    supabase = createClient(url, key);
  }
  return supabase;
}

/**
 * Insert an array of CRM records into the leads table.
 * Silently skips if Supabase is not configured.
 * @param {Array<Object>} records
 * @returns {Promise<{ inserted: number, errors: number }>}
 */
async function insertLeads(records) {
  const client = getSupabaseClient();
  if (!client || !records || records.length === 0) {
    return { inserted: 0, errors: 0 };
  }

  try {
    const rows = records.map((r) => ({
      created_at_lead: r.created_at || null,
      name: r.name || null,
      email: r.email || null,
      country_code: r.country_code || null,
      mobile: r.mobile_without_country_code || null,
      company: r.company || null,
      city: r.city || null,
      state: r.state || null,
      country: r.country || null,
      lead_owner: r.lead_owner || null,
      crm_status: r.crm_status || 'DID_NOT_CONNECT',
      crm_note: r.crm_note || null,
      data_source: r.data_source || null,
      possession_time: r.possession_time || null,
      description: r.description || null,
      imported_at: new Date().toISOString(),
    }));

    const { data, error } = await client.from('leads').insert(rows);

    if (error) {
      console.error('[Supabase] Insert error:', error.message);
      return { inserted: 0, errors: records.length };
    }

    console.log(`[Supabase] Inserted ${rows.length} leads.`);
    return { inserted: rows.length, errors: 0 };
  } catch (err) {
    console.error('[Supabase] Unexpected error:', err.message);
    return { inserted: 0, errors: records.length };
  }
}

/**
 * Fetch all leads from Supabase.
 * @returns {Promise<Array<Object>>}
 */
async function getAllLeads() {
  const client = getSupabaseClient();
  if (!client) return [];

  const { data, error } = await client
    .from('leads')
    .select('*')
    .order('imported_at', { ascending: false });

  if (error) {
    console.error('[Supabase] Fetch error:', error.message);
    return [];
  }

  return data || [];
}

module.exports = { insertLeads, getAllLeads };
