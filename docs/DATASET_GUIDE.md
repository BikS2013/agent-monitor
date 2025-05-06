# Dataset Guide

This document provides detailed information about the data management system in the AI Agent Monitor application.

## Dataset Options

The application supports multiple dataset size options to accommodate different use cases:

| Size | Conversations | Messages | Collections | Groups | Description |
|------|--------------|----------|------------|--------|-------------|
| Small | ~100 | ~750 | 5 | 3 | Lightweight dataset for quick loading and testing |
| Medium | ~500 | ~5,000 | 10 | 5 | Balanced dataset for typical development and demos |
| Large | ~2,000 | ~20,000 | 18 | 8 | Comprehensive dataset for realistic performance testing |

## Data Generation

The application uses a flexible data generation system that can create datasets of different sizes while maintaining realistic data relationships.

### Generation Process

1. The system creates AI agents and users as the foundation
2. Conversations are generated with timestamps distributed across different time periods:
   - Recent (last 24 hours)
   - Last week (excluding last 24 hours)
   - Last month (excluding last week)
   - Older (beyond last month)
3. Messages are created with realistic content patterns, including:
   - User queries categorized by support topics
   - AI responses appropriate to the topic
   - Follow-up exchanges with varied content
4. Collections are generated with realistic filtering criteria
5. Groups are created to organize collections with appropriate permissions

### Customization

The dataset generation can be customized by modifying the `build-dataset.js` script:

- Adjust the conversation distribution across time periods
- Modify message templates for different conversation types
- Add new support topics or AI agent types
- Change the distribution of closed vs. active conversations

## Data Sources

### In-Memory Data Source

The default data source uses an in-memory sample dataset from `sampleData.ts`. This provides a minimal amount of test data and is primarily used for initial development.

### JSON Data Source

The external JSON data source loads data from the generated JSON files in the `public` directory:

- `smallSampleData.json`
- `mediumSampleData.json`
- `largeSampleData.json`

This implementation includes:
- Lazy loading of data to improve initial page load time
- Efficient data lookup and filtering
- Proper metadata for performance optimization

## Switching Dataset Size

The application allows switching between dataset sizes through the Settings UI:

1. Navigate to the Settings view
2. In the "Data Source" section, select the desired dataset size
3. The application will reload with the new dataset

Note that dataset size selection is persisted in the browser's localStorage, so your preference will be remembered across sessions.

## Performance Considerations

- The small dataset is suitable for quick development and testing
- The medium dataset offers a balance between performance and realistic data volume
- The large dataset can be used to test application performance with substantial data loads

For production deployments, consider using the medium dataset initially and upgrading to the large dataset as needed based on performance testing.