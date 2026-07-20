const { BetaAnalyticsDataClient } = require('@google-analytics/data');

async function main() {
  const days = process.argv[2] || '30';
  const propertyId = process.env.GA4_PROPERTY_ID;

  if (!propertyId) {
    console.error(JSON.stringify({
      error: 'Missing GA4_PROPERTY_ID environment variable.',
      instruction: 'Please set GA4_PROPERTY_ID (e.g. export GA4_PROPERTY_ID="123456789") and GOOGLE_APPLICATION_CREDENTIALS pointing to your service account key file.'
    }));
    process.exit(1);
  }
  
  if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    console.error(JSON.stringify({
      error: 'Missing GOOGLE_APPLICATION_CREDENTIALS environment variable.',
      instruction: 'Please set GOOGLE_APPLICATION_CREDENTIALS pointing to your service account JSON key file.'
    }));
    process.exit(1);
  }

  const analyticsDataClient = new BetaAnalyticsDataClient();

  try {
    // 1. Fetch Top Pages
    const [pageResponse] = await analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [
        {
          startDate: `${days}daysAgo`,
          endDate: 'today',
        },
      ],
      dimensions: [
        { name: 'pagePath' },
        { name: 'pageTitle' }
      ],
      metrics: [
        { name: 'screenPageViews' }
      ],
      orderBys: [
        {
          desc: true,
          metric: { metricName: 'screenPageViews' }
        }
      ],
      limit: 10,
    });

    const top_pages = pageResponse.rows.map(row => ({
      path: row.dimensionValues[0].value,
      title: row.dimensionValues[1].value,
      views: parseInt(row.metricValues[0].value, 10)
    }));

    // 2. Fetch Top Sources
    const [sourceResponse] = await analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [
        {
          startDate: `${days}daysAgo`,
          endDate: 'today',
        },
      ],
      dimensions: [
        { name: 'sessionSourceMedium' }
      ],
      metrics: [
        { name: 'sessions' }
      ],
      orderBys: [
        {
          desc: true,
          metric: { metricName: 'sessions' }
        }
      ],
      limit: 10,
    });

    const top_sources = sourceResponse.rows.map(row => ({
      source: row.dimensionValues[0].value,
      sessions: parseInt(row.metricValues[0].value, 10)
    }));

    // Output JSON result
    console.log(JSON.stringify({
      period: `Last ${days} days`,
      top_pages,
      top_sources
    }, null, 2));

  } catch (err) {
    console.error(JSON.stringify({
      error: err.message,
      instruction: 'Failed to fetch GA4 data. Please check your credentials and property ID.'
    }));
    process.exit(1);
  }
}

main();
