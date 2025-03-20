import { HelloEntity } from '../../core/entities/hello.entity';
import { HelloRepository } from '../../adapters/repositories/hello.repository';

export class HelloUseCase {
  constructor(private readonly helloRepository: HelloRepository) {}

  async execute(): Promise<HelloEntity> {
    const cachedMessage = await this.helloRepository.getMessage();
    if (cachedMessage) {
      return new HelloEntity(cachedMessage);
    }
    
    const hello = HelloEntity.createDefault();
    await this.helloRepository.saveMessage(hello.message);
    return hello;
  }
} 