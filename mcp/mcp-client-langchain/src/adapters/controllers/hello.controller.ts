import { Request, Response } from 'express';
import { HelloUseCase } from '../../application/use-cases/hello.use-case';

export class HelloController {
  constructor(private readonly helloUseCase: HelloUseCase) {}

  async getHello(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.helloUseCase.execute();
      res.json({ message: result.message });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}