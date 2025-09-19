import config from '../config/mongoConfig';

const headers = {
  'Content-Type': 'application/json',
  'api-key': config.apiKey,
};

const baseBody = {
  dataSource: config.dataSource,
  database: config.database,
  collection: config.collection,
};

export async function mongoFind(filter = {}, limit = 50) {
  if (!config.enabled) throw new Error('mongo_disabled');
  const res = await fetch(`${config.dataApiUrl}/action/find`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ ...baseBody, filter, limit }),
  });
  if (!res.ok) throw new Error('mongo_find_failed');
  const json = await res.json();
  return json.documents || [];
}

export async function mongoInsertOne(document) {
  if (!config.enabled) throw new Error('mongo_disabled');
  const res = await fetch(`${config.dataApiUrl}/action/insertOne`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ ...baseBody, document }),
  });
  if (!res.ok) throw new Error('mongo_insert_failed');
  return res.json();
}

export async function mongoDeleteOne(filter) {
  if (!config.enabled) throw new Error('mongo_disabled');
  const res = await fetch(`${config.dataApiUrl}/action/deleteOne`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ ...baseBody, filter }),
  });
  if (!res.ok) throw new Error('mongo_delete_failed');
  return res.json();
}

// Helpers
export function toObjectId(idOrObj) {
  // Accept string or already-shaped { $oid: string }
  if (!idOrObj) return idOrObj;
  if (typeof idOrObj === 'object' && idOrObj.$oid) return idOrObj;
  if (typeof idOrObj === 'string' && /^[a-fA-F0-9]{24}$/.test(idOrObj)) {
    return { $oid: idOrObj };
  }
  // If not a valid ObjectId string, return as-is (assuming custom _id type)
  return idOrObj;
}



