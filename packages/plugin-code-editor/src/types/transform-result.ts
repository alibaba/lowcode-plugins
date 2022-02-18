export interface TransformResult {
  hasError: boolean;
  errorInfo?: string;
  code?: string;
  errorLocation?: {
    line: number;
    column: number;
  }
}
