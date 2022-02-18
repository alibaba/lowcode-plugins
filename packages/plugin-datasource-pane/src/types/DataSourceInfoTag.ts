export interface DataSourceInfoTag {
    color?: string;
    type?: 'normal' | 'primary';
    content?: string | React.ReactNode;
    tooltip?: boolean;
    tooltipContent?: string | React.ReactNode;
    maxWidth?: number;
}