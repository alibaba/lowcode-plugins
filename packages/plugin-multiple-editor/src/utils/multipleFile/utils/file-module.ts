export class FileModule {
  constructor(
    public name: string,
    public content: string,
    public children: FileModule[]
  ) {}
}

export class FileCls {
  constructor(public name: string, public content: string) {}
}
