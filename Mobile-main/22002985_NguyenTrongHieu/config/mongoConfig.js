// MongoDB Atlas Data API configuration
// 1) Enable Data API on your Atlas project
// 2) Create an API Key and allow your IP or set to 0.0.0.0/0 for testing
// 3) Fill the fields below and set enabled: true

export default {
  enabled: false, // set true after filling values
  dataApiUrl: '', // e.g. https://us-east-1.aws.data.mongodb-api.com/app/data-xxxxx/endpoint/data/v1
  apiKey: '', // Data API Key
  dataSource: '', // Cluster name (e.g. Cluster0)
  database: '', // Database name
  collection: '', // Collection name (e.g. medicines)
};


