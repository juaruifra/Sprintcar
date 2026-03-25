# Copilot Instructions for React Native Project

## Overview
This project is a React Native application that manages clients, orders, and products. It utilizes Supabase for backend services and employs React Query for data fetching and state management.

## Architecture
- **Components**: The UI is structured into reusable components located in the `src/components` directory. Key components include:
  - `AuthHeader`: Handles authentication headers.
  - `AuthTextInput`: Custom input fields for authentication.
  - `ClienteItem`: Displays individual client information.

- **Services**: Business logic and API interactions are encapsulated in the `src/services` directory. For example:
  - `clientesSupabaseService.ts`: Manages client data fetching and manipulation with Supabase.

- **Hooks**: Custom hooks like `useClientes` in `src/hooks` simplify data fetching and state management using React Query.

## Developer Workflows
- **Building the Project**: Use `npm run build` to compile the project.
- **Running the Project**: Start the development server with `npm start`.
- **Testing**: Run tests using `npm test`. Ensure to write tests for new components and services.

## Project Conventions
- **Naming Conventions**: Use camelCase for variable names and PascalCase for component names.
- **Data Mapping**: Data from Supabase is mapped to application types using functions like `mapRowToCliente` in `clientesSupabaseService.ts`.
- **Error Handling**: Errors from API calls are logged and thrown for handling in UI components.

## Integration Points
- **Supabase**: The application interacts with Supabase for data storage and retrieval. Ensure the Supabase client is correctly configured in `src/lib/supabaseClient.ts`.
- **React Query**: Used for managing server state and caching. Queries are defined in hooks like `useClientes`.

## Examples
- **Fetching Clients**: Use the `useClientes` hook to fetch and display a list of clients in the `ClientesScreen` component.
- **Creating a Client**: Call `createClienteApi` from `clientesSupabaseService.ts` to add a new client.

## Additional Resources
- Refer to the `README.md` for setup instructions and additional context about the project.
- Review the `src/data/mockApi.ts` for examples of mock data structures used in the application.

---

This document serves as a guide for AI coding agents to understand the structure and workflows of the project effectively. Please provide feedback on any unclear or incomplete sections to iterate further.