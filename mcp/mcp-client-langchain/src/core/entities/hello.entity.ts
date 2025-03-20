export class HelloEntity {
  constructor(public readonly message: string) {}

  static createDefault(): HelloEntity {
    return new HelloEntity("Hello, World!");
  }
} 