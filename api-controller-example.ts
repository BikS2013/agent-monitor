import express, { Request, Response, Router } from 'express';
import { IDataSource } from './src/data/sources/IDataSource';
import { AIAgent } from './src/data/types';

/**
 * Example controller implementation for AI Agents that implements
 * the API endpoints defined in the Swagger specification.
 */
export class AIAgentsController {
  private router: Router;
  private dataSource: IDataSource;
  
  constructor(dataSource: IDataSource) {
    this.dataSource = dataSource;
    this.router = express.Router();
    this.initializeRoutes();
  }
  
  /**
   * Initialize all routes related to AI Agents
   */
  private initializeRoutes(): void {
    // Get all AI agents or filter by IDs
    this.router.get('/', this.getAIAgents.bind(this));
    
    // Create a new AI agent
    this.router.post('/', this.createAIAgent.bind(this));
    
    // Get AI agent by ID
    this.router.get('/:id', this.getAIAgentById.bind(this));
    
    // Update an AI agent
    this.router.put('/:id', this.updateAIAgent.bind(this));
    
    // Delete an AI agent
    this.router.delete('/:id', this.deleteAIAgent.bind(this));
    
    // Get AI agents by status
    this.router.get('/status/:status', this.getAIAgentsByStatus.bind(this));
    
    // Get conversations by AI agent ID
    this.router.get('/:aiAgentId/conversations', this.getConversationsByAIAgentId.bind(this));
  }
  
  /**
   * Get AI agents by IDs or all AI agents if no IDs provided
   */
  private async getAIAgents(req: Request, res: Response): Promise<void> {
    try {
      const idParam = req.query.ids as string;
      let ids: string[] | undefined;
      
      if (idParam) {
        ids = idParam.split(',');
      }
      
      const agents = await this.dataSource.getAIAgents(ids);
      res.status(200).json(agents);
    } catch (error) {
      console.error('Error getting AI agents:', error);
      res.status(500).json({
        code: 500,
        message: 'Error retrieving AI agents',
        details: error
      });
    }
  }
  
  /**
   * Create a new AI agent
   */
  private async createAIAgent(req: Request, res: Response): Promise<void> {
    try {
      const agentData = req.body;
      
      if (!this.validateAIAgentInput(agentData)) {
        res.status(400).json({
          code: 400,
          message: 'Invalid AI agent data provided'
        });
        return;
      }
      
      const newAgent = await this.dataSource.createAIAgent(agentData);
      res.status(201).json(newAgent);
    } catch (error) {
      console.error('Error creating AI agent:', error);
      res.status(500).json({
        code: 500,
        message: 'Error creating AI agent',
        details: error
      });
    }
  }
  
  /**
   * Get AI agent by ID
   */
  private async getAIAgentById(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id;
      const agent = await this.dataSource.getAIAgentById(id);
      
      if (!agent) {
        res.status(404).json({
          code: 404,
          message: `AI agent with ID ${id} not found`
        });
        return;
      }
      
      res.status(200).json(agent);
    } catch (error) {
      console.error('Error getting AI agent by ID:', error);
      res.status(500).json({
        code: 500,
        message: 'Error retrieving AI agent',
        details: error
      });
    }
  }
  
  /**
   * Update an existing AI agent
   */
  private async updateAIAgent(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id;
      const updateData = req.body;
      
      const updatedAgent = await this.dataSource.updateAIAgent(id, updateData);
      
      if (!updatedAgent) {
        res.status(404).json({
          code: 404,
          message: `AI agent with ID ${id} not found`
        });
        return;
      }
      
      res.status(200).json(updatedAgent);
    } catch (error) {
      console.error('Error updating AI agent:', error);
      res.status(500).json({
        code: 500,
        message: 'Error updating AI agent',
        details: error
      });
    }
  }
  
  /**
   * Delete an AI agent
   */
  private async deleteAIAgent(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id;
      const success = await this.dataSource.deleteAIAgent(id);
      
      if (!success) {
        res.status(404).json({
          code: 404,
          message: `AI agent with ID ${id} not found or could not be deleted`
        });
        return;
      }
      
      res.status(200).json(success);
    } catch (error) {
      console.error('Error deleting AI agent:', error);
      res.status(500).json({
        code: 500,
        message: 'Error deleting AI agent',
        details: error
      });
    }
  }
  
  /**
   * Get AI agents by status
   */
  private async getAIAgentsByStatus(req: Request, res: Response): Promise<void> {
    try {
      const status = req.params.status as 'active' | 'inactive' | 'training';
      
      if (!['active', 'inactive', 'training'].includes(status)) {
        res.status(400).json({
          code: 400,
          message: 'Invalid status parameter. Must be one of: active, inactive, training'
        });
        return;
      }
      
      const agents = await this.dataSource.getAIAgentsByStatus(status);
      res.status(200).json(agents);
    } catch (error) {
      console.error('Error getting AI agents by status:', error);
      res.status(500).json({
        code: 500,
        message: 'Error retrieving AI agents by status',
        details: error
      });
    }
  }
  
  /**
   * Get conversations by AI agent ID
   */
  private async getConversationsByAIAgentId(req: Request, res: Response): Promise<void> {
    try {
      const aiAgentId = req.params.aiAgentId;
      const conversations = await this.dataSource.getConversationsByAIAgentId(aiAgentId);
      
      res.status(200).json(conversations);
    } catch (error) {
      console.error('Error getting conversations by AI agent ID:', error);
      res.status(500).json({
        code: 500,
        message: 'Error retrieving conversations by AI agent ID',
        details: error
      });
    }
  }
  
  /**
   * Helper method to validate AI agent input data
   */
  private validateAIAgentInput(data: any): boolean {
    const requiredFields = [
      'name',
      'model',
      'status',
      'conversationsProcessed',
      'successRate',
      'avgResponseTime',
      'lastActive'
    ];
    
    for (const field of requiredFields) {
      if (data[field] === undefined || data[field] === null) {
        return false;
      }
    }
    
    if (!['active', 'inactive', 'training'].includes(data.status)) {
      return false;
    }
    
    return true;
  }
  
  /**
   * Get the router instance
   */
  public getRouter(): Router {
    return this.router;
  }
}

/**
 * Example of how to set up Express app with the controllers
 */
export function setupApiServer(dataSource: IDataSource): express.Express {
  const app = express();
  
  app.use(express.json());
  
  // Add the AI Agents controller routes
  const aiAgentsController = new AIAgentsController(dataSource);
  app.use('/api/v1/aiagents', aiAgentsController.getRouter());
  
  // Add other controllers here...
  // const messagesController = new MessagesController(dataSource);
  // app.use('/api/v1/messages', messagesController.getRouter());
  
  // System endpoints
  app.post('/api/v1/system/initialize', async (req: Request, res: Response) => {
    try {
      await dataSource.initialize();
      res.status(200).json({ message: 'Data source initialized successfully' });
    } catch (error) {
      console.error('Error initializing data source:', error);
      res.status(500).json({
        code: 500,
        message: 'Error initializing data source',
        details: error
      });
    }
  });
  
  app.post('/api/v1/system/save', async (req: Request, res: Response) => {
    try {
      await dataSource.saveData();
      res.status(200).json({ message: 'Data saved successfully' });
    } catch (error) {
      console.error('Error saving data:', error);
      res.status(500).json({
        code: 500,
        message: 'Error saving data',
        details: error
      });
    }
  });
  
  app.post('/api/v1/system/cache/clear', async (req: Request, res: Response) => {
    try {
      await dataSource.clearCache();
      res.status(200).json({ message: 'Cache cleared successfully' });
    } catch (error) {
      console.error('Error clearing cache:', error);
      res.status(500).json({
        code: 500,
        message: 'Error clearing cache',
        details: error
      });
    }
  });
  
  return app;
}