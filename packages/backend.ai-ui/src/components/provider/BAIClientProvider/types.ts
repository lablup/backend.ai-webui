// Backend.AI Client Interface
export interface BAIClient {
  // Add methods and properties of the client here
  // Example:
  // request: (endpoint: string, options?: RequestInit) => Promise<any>;
  // Add more methods as needed based on the actual Backend.AI client API
  vfolder: {
    list_files: (path: string, id: string) => Promise<any>;
  };
}
