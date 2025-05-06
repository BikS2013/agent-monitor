# Documentation

This directory contains additional documentation for the AI Agent Monitor application.

## Available Documents

- [Dataset Guide](./DATASET_GUIDE.md) - Detailed information about data management, dataset sizes, and generation process

## Development Notes

The AI Agent Monitor application is designed to be:

1. **Flexible** - Supporting multiple dataset sizes for different use cases
2. **Scalable** - Using the repository pattern to abstract data access
3. **Maintainable** - With clear separation of concerns and component organization

### Architecture

The application follows a layered architecture:

- **Presentation Layer** - React components and views
- **State Management** - React Context API for global state
- **Data Access** - Repository pattern with interfaces and implementations
- **Data Sources** - Interface for different data sources (in-memory, JSON, etc.)

### Data Flow

Data flows through the application as follows:

1. Data Source → Repository → Context Provider → Components
2. User Interaction → Components → Context Provider → Repository → Data Source

For more detailed information on specific aspects of the application, refer to the guides in this directory.