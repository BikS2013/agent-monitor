# AI-Powered Contact Center Management System

A scalable web application for managing AI-driven customer service interactions with a hierarchical data model comprising messages → conversations → collections → groups, featuring advanced organization, filtering, and analytics capabilities.

## Features

- Real-time message handling with AI response generation
- AI agent workload management and performance tracking
- Dynamic collection system with flexible filtering
- Group management with hierarchical permissions
- Comprehensive analytics and reporting

## Project Structure

The application follows a component-based architecture with the following structure:

- **Data Layer**: Abstract data models with JSON implementation
- **Context API**: React Context for state management
- **Components**: Reusable UI components
- **Views**: Main application views

## Data Models

1. **Messages**: Atomic unit of communication
2. **Conversations**: Message aggregation
3. **Collections**: Conversation grouping
4. **Groups**: Collection aggregation
5. **AI Agents**: AI systems handling conversations

## Getting Started

### Prerequisites

- Node.js
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
   or
   ```
   yarn
   ```

### Development

Run the development server:
```
npm run dev
```
or
```
yarn dev
```

### Building for Production

Build the application:
```
npm run build
```
or
```
yarn build
```

## Technologies Used

- React
- TypeScript
- TailwindCSS
- Lucide Icons
